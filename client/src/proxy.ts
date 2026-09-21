import { NextResponse, type NextRequest } from 'next/server';

const AUTH_COOKIE = 'token';

/** Fast redirect to /login when there is no token at all; the API still verifies the JWT itself. */
export function proxy(request: NextRequest) {
  if (request.cookies.has(AUTH_COOKIE)) return NextResponse.next();

  const url = new URL('/login', request.url);
  url.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/', '/orders/:path*', '/products/:path*', '/stats/:path*'],
};
