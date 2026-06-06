import { NextResponse } from 'next/server';
import {
  getAccessTokenFromCookies,
  getRoleFromCookies,
} from '@/lib/auth/session.server';

export async function GET() {
  const token = await getAccessTokenFromCookies();
  const role = await getRoleFromCookies();

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, role });
}
