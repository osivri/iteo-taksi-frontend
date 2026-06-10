import { api, ApiResponse } from '@/lib/api/client';
import { hasActiveSession } from '@/lib/auth/client';
import type { MemberProfile } from '@/lib/member';

async function fetchProfileFromServerRoute(): Promise<MemberProfile | null> {
  const response = await fetch('/api/profile', { credentials: 'include' });
  if (response.status === 404) return null;
  if (!response.ok) {
    const json = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error ?? 'Profil yüklenemedi');
  }
  const json = (await response.json()) as { profile?: MemberProfile };
  return json.profile ?? null;
}

export async function fetchCurrentProfile(): Promise<MemberProfile | null> {
  const sessionOk = await hasActiveSession();
  if (!sessionOk) return null;

  const fromRoute = await fetchProfileFromServerRoute();
  if (fromRoute) return fromRoute;

  try {
    const res = await api.get<ApiResponse<MemberProfile>>('/users/me');
    return res.data ?? null;
  } catch (e) {
    throw e instanceof Error ? e : new Error('Profil yüklenemedi');
  }
}

export { hasActiveSession };

export async function completeOnboarding(input: {
  firstName: string;
  lastName: string;
  city: string;
  district: string;
  addressLine: string;
}): Promise<void> {
  await api.post('/users/me/onboarding', input);
}

export async function acceptKvkkConsent(): Promise<void> {
  await api.post('/users/me/kvkk-consent', {});
}
