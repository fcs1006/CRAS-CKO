import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { signSessionToken } from '@/lib/authSession'
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit'
import { registrarLogAuditoria } from '@/lib/auditLogger'
import { autenticarUsuarioD1 } from '@/lib/d1Client'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    const body = await request.json()
    const { usuario, senha } = body

    if (!usuario || !senha) {
      return NextResponse.json(
        { ok: false, error: 'Usuário e senha obrigatórios.' },
        { status: 400 }
      )
    }

    const usuarioLimpo = String(usuario).trim()
    const rateLimitKey = `login:${ip}:${usuarioLimpo}`
    const rateCheck = checkRateLimit(rateLimitKey, 5, 5 * 60 * 1000)

    if (!rateCheck.allowed) {
      await registrarLogAuditoria({
        acao: 'LOGIN_FALHA',
        usuario_nome: usuarioLimpo,
        detalhes: `Bloqueio temporário por excesso de tentativas (Rate Limit). Tente novamente em ${rateCheck.resetInSec}s.`,
        ip
      })

      return NextResponse.json(
        {
          ok: false,
          error: `Muitas tentativas consecutivas. Por segurança, sua conta foi temporariamente bloqueada. Tente novamente em ${rateCheck.resetInSec} segundos.`
        },
        { status: 429 }
      )
    }

    let authResult: any = null

    // 1. Tentativa prioritária e ultra-rápida no Cloudflare D1
    try {
      const d1Auth = await autenticarUsuarioD1(usuarioLimpo, String(senha).trim())
      if (d1Auth) {
        authResult = d1Auth
      }
    } catch (d1Err) {
      console.warn('[D1_AUTH_FALLBACK]:', d1Err)
    }

    // 2. Fallback para Supabase se o D1 não tiver resolvido
    if (!authResult) {
      try {
        const supabase = getSupabaseServer()
        const { data, error } = await supabase.rpc('fazer_login', {
          p_usuario: usuarioLimpo,
          p_senha: String(senha).trim()
        })

        if (!error && data) {
          authResult = data
        }
      } catch (sbErr) {
        console.warn('[SUPABASE_AUTH_FALLBACK_ERR]:', sbErr)
      }
    }

    if (!authResult || !authResult.ok) {
      await registrarLogAuditoria({
        acao: 'LOGIN_FALHA',
        usuario_nome: usuarioLimpo,
        detalhes: `Tentativa com credenciais inválidas. Restam ${rateCheck.remaining} tentativa(s).`,
        ip
      })

      return NextResponse.json(
        {
          ok: false,
          error: authResult?.error || 'Usuário ou senha incorretos.',
          tentativasRestantes: rateCheck.remaining
        },
        { status: 401 }
      )
    }

    const data = authResult


    // Login com sucesso: reseta limitador de taxa
    resetRateLimit(rateLimitKey)

    // Emissão do Token de Sessão Criptografado (HMAC-SHA256)
    const token = await signSessionToken({
      id: data.id,
      nome: data.nome,
      usuario: data.usuario,
      perfil: data.perfil,
      cargo: data.cargo,
      conselho: data.conselho
    })

    // Registro na trilha de auditoria
    await registrarLogAuditoria({
      usuario_id: String(data.id),
      usuario_nome: data.nome,
      usuario_perfil: data.perfil,
      acao: 'LOGIN_SUCESSO',
      detalhes: `Login realizado com sucesso. Perfil: ${data.perfil}.`,
      ip
    })

    const response = NextResponse.json(data)
    response.cookies.set('cras_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })

    return response
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e.message || 'Erro interno ao processar autenticação.'
      },
      { status: 500 }
    )
  }
}
