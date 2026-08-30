import { NextRequest, NextResponse } from 'next/server'
import { registrarLogAuditoria } from '@/lib/auditLogger'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userId = request.headers.get('x-auth-user-id') || undefined
  const userName = request.headers.get('x-auth-user-nome') || undefined

  await registrarLogAuditoria({
    acao: 'LOGOUT',
    usuario_id: userId,
    usuario_nome: userName,
    detalhes: 'Logout efetuado com encerramento de sessão.',
    ip
  })

  const response = NextResponse.json({ ok: true })
  response.cookies.set('cras_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })

  return response
}
