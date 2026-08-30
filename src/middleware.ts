import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/authSession'

// Rotas públicas que não requerem autenticação prévia
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/recuperar-senha/solicitar',
  '/api/auth/recuperar-senha/confirmar'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. ROTA DE TELA: /painel/:path*
  if (pathname.startsWith('/painel')) {
    const sessionCookie = request.cookies.get('cras_session')?.value
    const user = await verifySessionToken(sessionCookie)

    if (!user) {
      const loginUrl = new URL('/', request.url)
      const response = NextResponse.redirect(loginUrl)
      // Limpa cookie inválido ou corrompido
      response.cookies.delete('cras_session')
      return response
    }

    return NextResponse.next()
  }

  // 2. ROTAS DE API: /api/:path*
  if (pathname.startsWith('/api')) {
    // Permitir rotas públicas de autenticação
    if (PUBLIC_API_ROUTES.some(pubRoute => pathname.startsWith(pubRoute))) {
      return NextResponse.next()
    }

    const sessionCookie = request.cookies.get('cras_session')?.value
    const user = await verifySessionToken(sessionCookie)

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Acesso não autorizado. Sessão inválida, expirada ou ausente.'
        },
        { status: 401 }
      )
    }

    // Encaminha dados de identidade verificados para os route handlers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-auth-user-id', String(user.id))
    requestHeaders.set('x-auth-user-perfil', user.perfil)
    requestHeaders.set('x-auth-user-nome', user.nome)
    requestHeaders.set('x-auth-user-usuario', user.usuario)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/painel/:path*', '/api/:path*']
}
