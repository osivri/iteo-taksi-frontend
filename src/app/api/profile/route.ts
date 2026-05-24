import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { MemberProfile } from '@/lib/member';
import { COOKIE_ACCESS } from '@/lib/auth/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Profil alınamadı' }, { status: response.status });
  }

  const json = (await response.json()) as { data?: MemberProfile };
  if (!json.data) {
    return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({ profile: json.data });
}
