import { api, ApiResponse } from '@/lib/api/client';
import { getAccessToken, hasActiveSession } from '@/lib/auth/client';
import type { MemberProfile } from '@/lib/member';

async function fetchProfileFromServerRoute(): Promise<MemberProfile | null> {
  const response = await fetch('/api/profile', { credentials: 'include' });
  if (!response.ok) return null;
  const json = (await response.json()) as { profile?: MemberProfile };
  return json.profile ?? null;
}

export async function fetchCurrentProfile(): Promise<MemberProfile | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const fromRoute = await fetchProfileFromServerRoute();
  if (fromRoute) return fromRoute;

  try {
    const res = await api.get<ApiResponse<MemberProfile>>('/users/me');
    return res.data ?? null;
  } catch {
    return null;
  }
}

export { hasActiveSession };

export async function completeOnboarding(input: {
  firstName: string;
  lastName: string;
  role: MemberProfile['role'];
  city: string;
  district: string;
  addressLine: string;
}): Promise<void> {
  await api.post('/users/me/onboarding', input);
}

export async function acceptKvkkConsent(): Promise<void> {
  await api.post('/users/me/kvkk-consent', {});
}
