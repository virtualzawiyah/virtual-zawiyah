import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

const publicPaths = ['/', '/about', '/courses', '/fee', '/contact', '/enrollment', '/teachers', '/faq', '/login', '/staff/login', '/debug', '/terms', '/privacy', '/api/public', '/api/notifications/create']

const roleToPath: Record<string, string> = {
  student: '/student',
  parent: '/student',
  teacher: '/teacher',
  registrar: '/registrar',
  supervisor: '/supervisor',
  content_manager: '/content-manager',
  finance_officer: '/finance',
  academic_director: '/director',
  founder: '/founder',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  const supabase = createMiddlewareClient({ req: request, res: response })
  const { data: { session } } = await supabase.auth.getSession()

  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (!session) {
    if (isPublic) return response
    const isStaffPath = ['/teacher', '/registrar', '/supervisor', '/content-manager', '/finance', '/director', '/founder'].some(p => pathname.startsWith(p))
    return NextResponse.redirect(new URL(isStaffPath ? '/staff/login' : '/login', request.url))
  }

  const role = session.user.user_metadata?.role as string
  const allowedPath = roleToPath[role]

  if (pathname === '/login' || pathname === '/staff/login') {
    if (allowedPath) return NextResponse.redirect(new URL(allowedPath + '/dashboard', request.url))
  }

  if (!isPublic && allowedPath && !pathname.startsWith(allowedPath) && !pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL(allowedPath + '/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
