import { createClient } from '@/lib/supabase/client';
import { api, ApiResponse } from '@/lib/api/client';
import type { MemberProfile } from '@/lib/member';

type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  profile_image_url: string | null;
  role: MemberProfile['role'];
  status: string;
  kvkk_accepted_at: string | null;
};

function mapProfile(row: ProfileRow): MemberProfile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    profileImageUrl: row.profile_image_url,
    role: row.role,
    status: row.status,
    kvkkAcceptedAt: row.kvkk_accepted_at,
  };
}

async function fetchProfileFromServerRoute(): Promise<MemberProfile | null> {
  const response = await fetch('/api/profile', { credentials: 'include' });
  if (!response.ok) return null;
  const json = (await response.json()) as { profile?: MemberProfile };
  return json.profile ?? null;
}

async function fetchProfileFromBrowser(
  userId: string,
  metadata?: Record<string, unknown>,
): Promise<MemberProfile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, email, profile_image_url, role, status, kvkk_accepted_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) return null;

  if (!data) {
    const role =
      metadata?.intended_role === 'DRIVER' ||
      metadata?.intended_role === 'PLATE_OWNER' ||
      metadata?.intended_role === 'USER'
        ? (metadata.intended_role as MemberProfile['role'])
        : 'USER';

    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: 'İTEO',
        last_name: 'Üyesi',
        role,
        status: 'ACTIVE',
      })
      .select('id, first_name, last_name, phone, email, profile_image_url, role, status, kvkk_accepted_at')
      .single();

    if (insertError || !created) return null;
    return mapProfile(created as ProfileRow);
  }

  return mapProfile(data as ProfileRow);
}

export async function fetchCurrentProfile(): Promise<MemberProfile | null> {
  const supabase = createClient();

  // Oturum cookie'den yüklensin diye kısa retry
  for (let attempt = 0; attempt < 5; attempt++) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) break;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const fromRoute = await fetchProfileFromServerRoute();
  if (fromRoute) return fromRoute;

  try {
    const res = await api.get<ApiResponse<MemberProfile>>('/users/me');
    if (res.data) return res.data;
  } catch {
    // Backend kapalı veya geçici hata
  }

  return fetchProfileFromBrowser(user.id, user.user_metadata as Record<string, unknown>);
}

export async function hasActiveSession(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) return true;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}

export async function completeOnboarding(input: {
  firstName: string;
  lastName: string;
  role: MemberProfile['role'];
}): Promise<void> {
  try {
    await api.post('/users/me/onboarding', input);
    return;
  } catch {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Oturum bulunamadı');

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        role: input.role,
        status: 'ACTIVE',
      })
      .eq('id', user.id);

    if (error) throw new Error(error.message);
  }
}

export async function acceptKvkkConsent(): Promise<void> {
  try {
    await api.post('/users/me/kvkk-consent', {});
    return;
  } catch {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Oturum bulunamadı');

    const { error } = await supabase
      .from('profiles')
      .update({ kvkk_accepted_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw new Error(error.message);
  }
}
