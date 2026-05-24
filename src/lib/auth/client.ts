import type { MemberProfile } from '@/lib/member';
import {
  clearSession,
  getAccessTokenFromDocument,
  getRefreshTokenFromDocument,
  setSession,
  type AuthSessionPayload,
} from './session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface AuthApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number | null;
  user?: MemberProfile;
}

interface RegisterResult extends Partial<AuthTokens> {
  requiresEmailConfirmation?: boolean;
  message?: string;
}

async function parseError(response: Response, fallback: string): Promise<string> {
  try {
    const json = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join(', ');
    return json.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshTokenFromDocument();
  if (!refreshToken) return null;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearSession();
    return null;
  }

  const json = (await response.json()) as AuthApiResponse<AuthSessionPayload>;
  if (!json.data?.accessToken || !json.data.refreshToken) {
    clearSession();
    return null;
  }

  setSession(json.data);
  return json.data.accessToken;
}

export async function getAccessToken(): Promise<string | null> {
  const existing = getAccessTokenFromDocument();
  if (existing) return existing;
  return refreshAccessToken();
}

export async function loginMember(email: string, password: string): Promise<MemberProfile> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Giriş yapılamadı'));
  }

  const json = (await response.json()) as AuthApiResponse<AuthTokens>;
  if (!json.data?.accessToken || !json.data.refreshToken) {
    throw new Error('Giriş yanıtı geçersiz');
  }

  setSession(json.data);
  return json.data.user!;
}

export async function loginAdmin(email: string, password: string): Promise<MemberProfile> {
  const response = await fetch(`${API_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Giriş yapılamadı'));
  }

  const json = (await response.json()) as AuthApiResponse<AuthTokens>;
  if (!json.data?.accessToken || !json.data.refreshToken) {
    throw new Error('Giriş yanıtı geçersiz');
  }

  setSession(json.data);
  return json.data.user!;
}

export async function registerMember(
  email: string,
  password: string,
  intendedRole: 'USER' | 'DRIVER' | 'PLATE_OWNER',
): Promise<RegisterResult> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, intendedRole }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Kayıt oluşturulamadı'));
  }

  const json = (await response.json()) as AuthApiResponse<RegisterResult>;
  if (json.data?.accessToken && json.data.refreshToken) {
    setSession(json.data as AuthSessionPayload);
  }
  return json.data ?? {};
}

export async function logoutSession(): Promise<void> {
  const token = getAccessTokenFromDocument();
  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }
  clearSession();
}

export async function hasActiveSession(): Promise<boolean> {
  return !!(await getAccessToken());
}
