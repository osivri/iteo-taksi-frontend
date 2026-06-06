import { NextResponse } from 'next/server';
import type { MemberProfile } from '@/lib/member';
import { getServerApiUrl } from '@/lib/config';
import { refreshAccessTokenOnServer } from '@/lib/auth/refresh.server';
import { getAccessTokenFromCookies } from '@/lib/auth/session.server';

export async function GET() {
  let token = await getAccessTokenFromCookies();

  if (!token) {
    return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
  }

  let response = await fetch(`${getServerApiUrl()}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (response.status === 401) {
    token = await refreshAccessTokenOnServer();
    if (!token) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }
    response = await fetch(`${getServerApiUrl()}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  }

  if (!response.ok) {
    return NextResponse.json({ error: 'Profil alınamadı' }, { status: response.status });
  }

  const json = (await response.json()) as { data?: MemberProfile };
  if (!json.data) {
    return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({ profile: json.data });
}
