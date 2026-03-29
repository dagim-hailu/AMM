import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_STORAGE_KEY = 'amm_auth';
const PUBLIC_PATHS = ['/login', '/register', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths and API auth endpoints
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for authentication token
  const authData = request.cookies.get(AUTH_STORAGE_KEY)?.value;
  
  if (!authData) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Parse auth data to check basic validity
    const parsed = JSON.parse(authData);
    
    // Check if token is expired (basic client-side check)
    if (parsed.accessToken && parsed.user) {
      // You could add more sophisticated checks here
      // For now, just allow access
      return NextResponse.next();
    }
  } catch {
    // Invalid auth data, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};