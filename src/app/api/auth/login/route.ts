import { NextResponse } from 'next/server';
import { getServerApiUrl } from '@/lib/config';
import { parseBackendMessage } from '@/lib/api/errors';
import { setAuthCookies } from '@/lib/auth/session.server';

interface AuthApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string | string[];
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number | null;
  user?: { role?: string };
}

async function forwardAuth(
  path: string,
  body: unknown,
  fallbackError: string,
): Promise<NextResponse> {
  try {
    const response = await fetch(`${getServerApiUrl()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const json = (await response.json()) as AuthApiResponse<AuthTokens>;

    if (!response.ok) {
      const message = parseBackendMessage(json, fallbackError);
      return NextResponse.json({ message }, { status: response.status });
    }

    if (!json.data?.accessToken || !json.data.refreshToken) {
      return NextResponse.json({ message: 'Giriş yanıtı geçersiz' }, { status: 500 });
    }

    await setAuthCookies({
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken,
      expiresAt: json.data.expiresAt,
      role: json.data.user?.role,
    });

    return NextResponse.json({ success: true, user: json.data.user ?? null });
  } catch {
    return NextResponse.json({ message: fallbackError }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json({ message: 'E-posta ve şifre zorunludur' }, { status: 400 });
  }
  return forwardAuth('/auth/login', body, 'Giriş yapılamadı');
}
