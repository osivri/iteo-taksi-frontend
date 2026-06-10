'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorBlock, LoadingBlock } from '@/components/admin/AdminUi';
import { FindDriverPanel } from '@/components/member/marketplace/FindDriverPanel';
import { fetchCurrentProfile } from '@/lib/member-profile';
import type { MemberProfile } from '@/lib/member';

export default function FindDriverPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentProfile()
      .then((p) => {
        setProfile(p);
        if (p?.role !== 'PLATE_OWNER') router.replace('/panel');
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (profile?.role !== 'PLATE_OWNER') return null;

  return <FindDriverPanel />;
}
