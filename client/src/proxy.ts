import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE } from '@/lib/config';

/** Fast redirect to /login when there is no token at all; the API still verifies the JWT itself. */
export function proxy(request: NextRequest) {
  if (request.cookies.has(AUTH_COOKIE)) return NextResponse.next();

  const url = new URL('/login', request.url);
  url.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/', '/orders/:path*', '/products/:path*'],
};
