import { redirect } from 'next/navigation';
import {
  getAccessTokenFromCookies,
  getRoleFromCookies,
} from '@/lib/auth/session.server';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export async function requireAdminSession(): Promise<void> {
  const token = await getAccessTokenFromCookies();
  const role = await getRoleFromCookies();

  if (!token || !role || !ADMIN_ROLES.includes(role)) {
    redirect('/login');
  }
}
