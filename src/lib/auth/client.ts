import type { MemberProfile } from '@/lib/member';

interface AuthUserResponse {
  success?: boolean;
  user?: MemberProfile;
  message?: string;
}

interface RegisterApiResponse {
  success?: boolean;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    requiresEmailConfirmation?: boolean;
    message?: string;
  };
  message?: string;
}

async function parseAuthError(response: Response, fallback: string): Promise<string> {
  try {
    const json = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join(', ');
    return json.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function hasActiveSession(): Promise<boolean> {
  const response = await fetch('/api/auth/session', { credentials: 'include' });
  if (!response.ok) return false;
  const json = (await response.json()) as { authenticated?: boolean };
  return !!json.authenticated;
}

export async function loginMember(email: string, password: string): Promise<MemberProfile> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseAuthError(response, 'Giriş yapılamadı'));
  }

  const json = (await response.json()) as AuthUserResponse;
  if (!json.user) {
    throw new Error('Giriş yanıtı geçersiz');
  }
  return json.user;
}

export async function loginAdmin(email: string, password: string): Promise<MemberProfile> {
  const response = await fetch('/api/auth/admin/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseAuthError(response, 'Giriş yapılamadı'));
  }

  const json = (await response.json()) as AuthUserResponse;
  if (!json.user) {
    throw new Error('Giriş yanıtı geçersiz');
  }
  return json.user;
}

export async function registerMember(
  email: string,
  password: string,
  intendedRole: 'USER' | 'DRIVER' | 'PLATE_OWNER',
): Promise<{
  accessToken?: string;
  requiresEmailConfirmation?: boolean;
  message?: string;
}> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, intendedRole }),
  });

  if (!response.ok) {
    throw new Error(await parseAuthError(response, 'Kayıt oluşturulamadı'));
  }

  const json = (await response.json()) as RegisterApiResponse;
  return json.data ?? {};
}

export async function logoutSession(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}

export async function refreshAccessToken(): Promise<boolean> {
  const response = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
  return response.ok;
}

/** @deprecated Tokens are HttpOnly; use BFF `/api/backend` instead. */
export async function getAccessToken(): Promise<string | null> {
  const ok = await hasActiveSession();
  return ok ? 'cookie-session' : null;
}
