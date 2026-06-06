import { getServerApiUrl } from '@/lib/config';
import {
  clearAuthCookies,
  getRefreshTokenFromCookies,
  getRoleFromCookies,
  setAuthCookies,
} from '@/lib/auth/session.server';

interface RefreshResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresAt?: number | null;
  };
}

/** Refresh access token using HttpOnly refresh cookie. Returns new access token or null. */
export async function refreshAccessTokenOnServer(): Promise<string | null> {
  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) {
    await clearAuthCookies();
    return null;
  }

  const response = await fetch(`${getServerApiUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!response.ok) {
    await clearAuthCookies();
    return null;
  }

  const json = (await response.json()) as RefreshResponse;
  if (!json.data?.accessToken || !json.data.refreshToken) {
    await clearAuthCookies();
    return null;
  }

  const role = await getRoleFromCookies();
  await setAuthCookies({
    accessToken: json.data.accessToken,
    refreshToken: json.data.refreshToken,
    expiresAt: json.data.expiresAt,
    role: role ?? undefined,
  });

  return json.data.accessToken;
}
