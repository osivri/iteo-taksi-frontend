export const COOKIE_ACCESS = 'iteo_access_token';
export const COOKIE_REFRESH = 'iteo_refresh_token';
export const COOKIE_ROLE = 'iteo_user_role';

export interface AuthSessionPayload {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number | null;
  user?: { role?: string };
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
