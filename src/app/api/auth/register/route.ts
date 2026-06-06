import { NextResponse } from 'next/server';
import { getServerApiUrl } from '@/lib/config';
import { parseBackendMessage } from '@/lib/api/errors';
import { setAuthCookies } from '@/lib/auth/session.server';

interface AuthApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string | string[];
}

interface RegisterResult extends Partial<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
  user: { role?: string };
  requiresEmailConfirmation: boolean;
  message: string;
}> {}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    intendedRole?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json({ message: 'E-posta ve şifre zorunludur' }, { status: 400 });
  }

  try {
    const response = await fetch(`${getServerApiUrl()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const json = (await response.json()) as AuthApiResponse<RegisterResult>;

    if (!response.ok) {
      return NextResponse.json(
        { message: parseBackendMessage(json, 'Kayıt oluşturulamadı') },
        { status: response.status },
      );
    }

    const data = json.data ?? {};

    if (data.accessToken && data.refreshToken) {
      await setAuthCookies({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        role: data.user?.role,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ message: 'Kayıt oluşturulamadı' }, { status: 500 });
  }
}
