import { NextResponse } from 'next/server';
import { getServerApiUrl } from '@/lib/config';
import {
  clearAuthCookies,
  getAccessTokenFromCookies,
} from '@/lib/auth/session.server';

export async function POST() {
  const token = await getAccessTokenFromCookies();

  if (token) {
    await fetch(`${getServerApiUrl()}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }).catch(() => undefined);
  }

  await clearAuthCookies();
  return NextResponse.json({ success: true });
}
