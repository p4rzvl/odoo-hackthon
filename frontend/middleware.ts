import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Paths requiring authentication
  const protectedPaths = [
    '/dashboard',
    '/vendors',
    '/rfqs',
    '/quotations',
    '/approvals',
    '/invoices',
    '/invoice-print',
    '/purchase-orders',
    '/activity-logs',
    '/reports',
    '/admin'
  ];

  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !token) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/vendors/:path*',
    '/rfqs/:path*',
    '/quotations/:path*',
    '/approvals/:path*',
    '/invoices/:path*',
    '/invoice-print/:path*',
    '/purchase-orders/:path*',
    '/activity-logs/:path*',
    '/reports/:path*',
    '/login',
    '/register',
  ],
};
