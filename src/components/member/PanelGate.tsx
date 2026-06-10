'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchCurrentProfile, hasActiveSession } from '@/lib/member-profile';
import {
  getLoginIntent,
  needsAddressSetup,
  needsKvkkAcceptance,
  needsProfileSetup,
  type MemberProfile,
} from '@/lib/member';
import { isPanelPathAllowed } from '@/lib/panel-routes';
import { MemberProfileProvider } from '@/components/member/MemberProfileContext';

const SETUP_PATHS = ['/panel/onboarding', '/panel/kvkk', '/panel/address'];

export function PanelGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setError(null);
      setReady(false);

      const sessionOk = await hasActiveSession();
      if (!sessionOk) {
        const rol = getLoginIntent() ?? 'sofor';
        if (!cancelled) router.replace(`/giris?rol=${rol}`);
        return;
      }

      let currentProfile: MemberProfile | null = null;
      try {
        currentProfile = await fetchCurrentProfile();
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          setReady(true);
        }
        return;
      }

      if (!currentProfile) {
        if (!cancelled) {
          setProfile(null);
          if (pathname !== '/panel/onboarding') {
            router.replace('/panel/onboarding');
          } else {
            setReady(true);
          }
        }
        return;
      }

      if (currentProfile.role === 'ADMIN' || currentProfile.role === 'SUPER_ADMIN') {
        if (!cancelled) router.replace('/login');
        return;
      }

      const onSetupPath = SETUP_PATHS.some((p) => pathname.startsWith(p));

      if (needsProfileSetup(currentProfile) && pathname !== '/panel/onboarding') {
        if (!cancelled) router.replace('/panel/onboarding');
        return;
      }

      if (
        !needsProfileSetup(currentProfile) &&
        needsKvkkAcceptance(currentProfile) &&
        pathname !== '/panel/kvkk'
      ) {
        if (!cancelled) router.replace('/panel/kvkk');
        return;
      }

      if (
        !needsProfileSetup(currentProfile) &&
        !needsKvkkAcceptance(currentProfile) &&
        needsAddressSetup(currentProfile) &&
        pathname !== '/panel/address'
      ) {
        if (!cancelled) router.replace('/panel/address');
        return;
      }

      if (
        !needsProfileSetup(currentProfile) &&
        !needsKvkkAcceptance(currentProfile) &&
        !needsAddressSetup(currentProfile) &&
        onSetupPath
      ) {
        if (!cancelled) router.replace('/panel');
        return;
      }

      if (
        !needsProfileSetup(currentProfile) &&
        !needsKvkkAcceptance(currentProfile) &&
        !needsAddressSetup(currentProfile) &&
        !isPanelPathAllowed(pathname, currentProfile.role)
      ) {
        if (!cancelled) router.replace('/panel');
        return;
      }

      if (!cancelled) {
        setProfile(currentProfile);
        setReady(true);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-iteo-gray-100 text-iteo-gray-500">
        <p>Yükleniyor...</p>
        {error && <p className="max-w-sm px-4 text-center text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return <MemberProfileProvider profile={profile}>{children}</MemberProfileProvider>;
}
