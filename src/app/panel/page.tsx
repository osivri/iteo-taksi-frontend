'use client';

import { useEffect, useState } from 'react';
import { ErrorBlock, LoadingBlock } from '@/components/admin/AdminUi';
import { MemberModuleLauncher } from '@/components/member/MemberModuleLauncher';
import { fetchCurrentProfile } from '@/lib/member-profile';
import type { MemberProfile } from '@/lib/member';
import { toMemberRole } from '@/lib/member';

export default function PanelHomePage() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentProfile()
      .then((p) => {
        setProfile(p);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!profile) return <ErrorBlock message="Profil bulunamadı" />;

  const role = toMemberRole(profile.role);

  return (
    <MemberModuleLauncher
      role={role}
      firstName={profile.firstName}
      lastName={profile.lastName}
    />
  );
}
