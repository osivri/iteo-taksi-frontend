export const COOKIE_ACCESS = 'iteo_access_token';
export const COOKIE_REFRESH = 'iteo_refresh_token';
export const COOKIE_ROLE = 'iteo_user_role';

export interface AuthSessionPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number | null;
  user?: { role?: string };
}

function cookieMaxAge(expiresAt?: number | null): number {
  if (expiresAt) {
    const seconds = expiresAt - Math.floor(Date.now() / 1000);
    return seconds > 0 ? seconds : 3600;
  }
  return 3600;
}

function setBrowserCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function readBrowserCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function clearBrowserCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function setSession(session: AuthSessionPayload) {
  if (typeof document === 'undefined') return;

  const accessMaxAge = cookieMaxAge(session.expiresAt);
  setBrowserCookie(COOKIE_ACCESS, session.accessToken, accessMaxAge);
  setBrowserCookie(COOKIE_REFRESH, session.refreshToken, 60 * 60 * 24 * 30);
  if (session.user?.role) {
    setBrowserCookie(COOKIE_ROLE, session.user.role, 60 * 60 * 24 * 30);
  }
}

export function clearSession() {
  if (typeof document === 'undefined') return;
  clearBrowserCookie(COOKIE_ACCESS);
  clearBrowserCookie(COOKIE_REFRESH);
  clearBrowserCookie(COOKIE_ROLE);
}

export function getAccessTokenFromDocument(): string | null {
  if (typeof document === 'undefined') return null;
  return readBrowserCookie(COOKIE_ACCESS);
}

export function getRefreshTokenFromDocument(): string | null {
  if (typeof document === 'undefined') return null;
  return readBrowserCookie(COOKIE_REFRESH);
}

export function getUserRoleFromDocument(): string | null {
  if (typeof document === 'undefined') return null;
  return readBrowserCookie(COOKIE_ROLE);
}

export function getAccessTokenFromRequestCookies(
  cookies: { get: (name: string) => { value: string } | undefined },
): string | null {
  return cookies.get(COOKIE_ACCESS)?.value ?? null;
}

export function getUserRoleFromRequestCookies(
  cookies: { get: (name: string) => { value: string } | undefined },
): string | null {
  return cookies.get(COOKIE_ROLE)?.value ?? null;
}
