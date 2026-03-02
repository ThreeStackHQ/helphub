import { auth } from './auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Protect dashboard routes (all pages inside (dashboard) route group resolve to these paths)
  const protectedPrefixes = ['/dashboard', '/articles', '/collections', '/analytics', '/settings'];
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (isProtected) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Custom domain detection — proxy to /[slug] based on host
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? '';
  const isCustomDomain =
    host &&
    !host.includes('localhost') &&
    !host.includes('helphub.threestack.io') &&
    !host.includes('vercel.app');

  if (isCustomDomain) {
    const response = NextResponse.next();
    response.headers.set('x-custom-domain', host);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/articles/:path*',
    '/collections/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
