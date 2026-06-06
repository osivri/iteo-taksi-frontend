import { NextResponse, type NextRequest } from 'next/server';
import {
  getAccessTokenFromRequestCookies,
  getUserRoleFromRequestCookies,
} from '@/lib/auth/session';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export async function middleware(request: NextRequest) {
  const accessToken = getAccessTokenFromRequestCookies(request.cookies);
  const role = getUserRoleFromRequestCookies(request.cookies);
  const isAuthenticated = !!accessToken;

  const path = request.nextUrl.pathname;
  const isDashboard = path.startsWith('/dashboard');
  const isAdminLogin = path.startsWith('/login');
  const isPanel = path.startsWith('/panel');
  const isMemberAuth = path.startsWith('/giris');

  if (isDashboard && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isDashboard && isAuthenticated && (!role || !ADMIN_ROLES.includes(role))) {
    return NextResponse.redirect(new URL('/panel', request.url));
  }

  if (isAdminLogin && isAuthenticated && role && ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isPanel && !isAuthenticated) {
    const rol = request.nextUrl.searchParams.get('rol');
    const girisUrl = rol ? `/giris?rol=${rol}` : '/giris';
    return NextResponse.redirect(new URL(girisUrl, request.url));
  }

  if (isPanel && isAuthenticated && role && ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isMemberAuth && isAuthenticated) {
    return NextResponse.redirect(new URL('/panel', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/panel/:path*', '/giris/:path*'],
};
