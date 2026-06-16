import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const path = req.nextUrl.pathname

  // Public paths that do not require authentication
  const publicPaths = [
    '/',
    '/courses',
    '/about',
    '/pricing',
    '/enrollment',
    '/trial-request',
    '/contact',
    '/login'
  ]
  
  const isPublicPath = publicPaths.includes(path)

  // Redirect to /login if user is not authenticated and is trying to access a protected route
  if (!user) {
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return res
  }

  // Fetch the user's role from their profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  // If user is authenticated and goes to login, redirect to their dashboard
  if (path === '/login') {
    if (role) {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
    }
    // Fallback if role is not found (should not happen if profile setup is correct)
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redirect /dashboard (generic URL) to role-specific dashboard
  if (path === '/dashboard') {
    if (role) {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
    }
    return res
  }

  // Role-based route guard checks
  if (path.startsWith('/teacher') && role !== 'teacher') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  if (path.startsWith('/student') && role !== 'student') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  if (path.startsWith('/parent') && role !== 'parent') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

// Ensure the middleware runs on all paths except static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)',
  ],
}
