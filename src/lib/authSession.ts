// Utilitário de Sessão Criptografada (HMAC-SHA256) compatível com Edge Runtime e Node.js

export interface SessionUser {
  id: string | number
  nome: string
  usuario: string
  perfil: 'admin' | 'coordenador' | 'tecnico' | 'recepcao' | string
  cargo?: string
  conselho?: string
  iat?: number
  exp?: number
}

const DEFAULT_SECRET = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'cras-suas-digital-secret-token-key-2026-production'

function base64UrlEncode(str: string): string {
  const base64 = typeof Buffer !== 'undefined'
    ? Buffer.from(str).toString('base64')
    : btoa(str)
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return typeof Buffer !== 'undefined'
    ? Buffer.from(base64, 'base64').toString('utf8')
    : atob(base64)
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/**
 * Assina e cria um token de sessão seguro (JWT HMAC-SHA256)
 * @param user Dados do usuário
 * @param maxAgeSec Tempo de expiração em segundos (padrão: 7 dias)
 */
export async function signSessionToken(user: Omit<SessionUser, 'iat' | 'exp'>, maxAgeSec = 60 * 60 * 24 * 7): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload: SessionUser = {
    ...user,
    iat: now,
    exp: now + maxAgeSec
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const dataToSign = `${encodedHeader}.${encodedPayload}`

  const key = await getCryptoKey(DEFAULT_SECRET)
  const enc = new TextEncoder()
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign))

  const signatureBase64 = typeof Buffer !== 'undefined'
    ? Buffer.from(signatureBuffer).toString('base64')
    : btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
  
  const encodedSignature = signatureBase64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return `${dataToSign}.${encodedSignature}`
}

/**
 * Valida a assinatura criptográfica e a expiração do token de sessão
 * @param token Token em formato header.payload.signature
 * @returns SessionUser se válido, ou null se corrompido/expirado/inválido
 */
export async function verifySessionToken(token: string | null | undefined): Promise<SessionUser | null> {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [encodedHeader, encodedPayload, encodedSignature] = parts

  try {
    const dataToSign = `${encodedHeader}.${encodedPayload}`
    const key = await getCryptoKey(DEFAULT_SECRET)

    // Decodificar assinatura para Uint8Array
    let sigBase64 = encodedSignature.replace(/-/g, '+').replace(/_/g, '/')
    while (sigBase64.length % 4) {
      sigBase64 += '='
    }

    const sigBytes = typeof Buffer !== 'undefined'
      ? new Uint8Array(Buffer.from(sigBase64, 'base64'))
      : Uint8Array.from(atob(sigBase64), c => c.charCodeAt(0))

    const enc = new TextEncoder()
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(dataToSign))

    if (!isValid) return null

    const payloadJson = base64UrlDecode(encodedPayload)
    const payload: SessionUser = JSON.parse(payloadJson)

    // Checar expiração
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
