import { NextResponse } from 'next/server';
import { refreshAccessTokenOnServer } from '@/lib/auth/refresh.server';

export async function POST() {
  const token = await refreshAccessTokenOnServer();
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
