import { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import {
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  COOKIE_ROLE,
  type AuthSessionPayload,
} from '@/lib/auth/session';

const isProd = process.env.NODE_ENV === 'production';

function cookieMaxAge(expiresAt?: number | null): number {
  if (expiresAt) {
    const seconds = expiresAt - Math.floor(Date.now() / 1000);
    return seconds > 0 ? seconds : 3600;
  }
  return 3600;
}

function baseCookieOptions(maxAge: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

export async function setAuthCookies(session: AuthSessionPayload & { role?: string }) {
  const store = await cookies();
  const accessMaxAge = cookieMaxAge(session.expiresAt);

  store.set(COOKIE_ACCESS, session.accessToken, baseCookieOptions(accessMaxAge));
  store.set(COOKIE_REFRESH, session.refreshToken, baseCookieOptions(60 * 60 * 24 * 30));

  const role = session.role ?? session.user?.role;
  if (role) {
    store.set(COOKIE_ROLE, role, baseCookieOptions(60 * 60 * 24 * 30));
  }
}

export async function clearAuthCookies() {
  const store = await cookies();
  const expired = baseCookieOptions(0);

  for (const name of [COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_ROLE]) {
    store.set(name, '', expired);
  }
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
  return (await cookies()).get(COOKIE_ACCESS)?.value ?? null;
}

export async function getRefreshTokenFromCookies(): Promise<string | null> {
  return (await cookies()).get(COOKIE_REFRESH)?.value ?? null;
}

export async function getRoleFromCookies(): Promise<string | null> {
  return (await cookies()).get(COOKIE_ROLE)?.value ?? null;
}
