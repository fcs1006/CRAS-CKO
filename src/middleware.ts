import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/painel')) {
    const sessionCookie = request.cookies.get('cras_session')
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/painel/:path*']
}
