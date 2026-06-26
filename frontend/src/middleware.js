import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const match = pathname.match(/^\/(.+)\.(js|txt|html|css|json|xml|svg)$/);
  if (match) {
    req.nextUrl.pathname = `/api/root-files/${match[1]}.${match[2]}`;
    return NextResponse.rewrite(req.nextUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next|api|static|favicon).*)',
};
