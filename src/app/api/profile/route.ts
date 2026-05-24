import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { MemberProfile, MemberRole } from '@/lib/member';

function resolveRoleFromMetadata(metadata: Record<string, unknown> | undefined): MemberRole {
  const role = metadata?.intended_role;
  if (role === 'DRIVER' || role === 'PLATE_OWNER' || role === 'USER') return role;
  return 'USER';
}

function mapProfile(row: {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  profile_image_url: string | null;
  role: MemberProfile['role'];
  status: string;
  kvkk_accepted_at: string | null;
}): MemberProfile {
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

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, email, profile_image_url, role, status, kvkk_accepted_at')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profile) {
    const role = resolveRoleFromMetadata(user.user_metadata as Record<string, unknown>);
    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email ?? null,
        first_name: 'İTEO',
        last_name: 'Üyesi',
        role,
        status: 'ACTIVE',
      })
      .select('id, first_name, last_name, phone, email, profile_image_url, role, status, kvkk_accepted_at')
      .single();

    if (insertError || !created) {
      return NextResponse.json(
        { error: insertError?.message ?? 'Profil oluşturulamadı' },
        { status: 500 },
      );
    }

    return NextResponse.json({ profile: mapProfile(created) });
  }

  return NextResponse.json({ profile: mapProfile(profile) });
}
