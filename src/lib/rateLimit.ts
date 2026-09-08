// Utilitário de Limitação de Taxa (Rate Limiting) em memória para proteção contra força bruta

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

/**
 * Verifica se a chave atingiu o limite de requisições na janela de tempo especificada.
 * @param key Identificador (ex: IP ou IP+CPF)
 * @param maxAttempts Número máximo de tentativas permitidas na janela
 * @param windowMs Duração da janela em milissegundos (padrão: 5 minutos)
 * @returns { allowed: boolean, remaining: number, resetInSec: number }
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 5 * 60 * 1000
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  // Limpeza de registros expirados se a lista crescer
  if (rateLimitStore.size > 5000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }
  }

  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetInSec: Math.ceil(windowMs / 1000)
    }
  }

  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.max(1, Math.ceil((record.resetTime - now) / 1000))
    }
  }

  record.count += 1
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    resetInSec: Math.ceil((record.resetTime - now) / 1000)
  }
}

/**
 * Reseta o contador para um identificador (usado ao efetuar login com sucesso)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}
