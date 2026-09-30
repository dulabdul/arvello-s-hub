import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NextAuth-related paths might need to be ignored, but we're fully custom now
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/proposals/public') ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // Get session cookie
  const session = request.cookies.get('fh_session')?.value;

  // Validate session
  let parsedSession = null;
  if (session) {
    parsedSession = await decrypt(session);
  }

  // Redirect to login if unauthenticated and trying to access protected route
  if (!isPublicRoute && !parsedSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if authenticated and trying to access login page
  if (isPublicRoute && parsedSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (e.g. .svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
