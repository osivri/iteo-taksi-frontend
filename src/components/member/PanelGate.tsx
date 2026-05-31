'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchCurrentProfile, hasActiveSession } from '@/lib/member-profile';
import {
  getLoginIntent,
  needsAddressSetup,
  needsKvkkAcceptance,
  needsProfileSetup,
} from '@/lib/member';

const SETUP_PATHS = ['/panel/onboarding', '/panel/kvkk', '/panel/address'];

export function PanelGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setError(null);

      const sessionOk = await hasActiveSession();
      if (!sessionOk) {
        const rol = getLoginIntent() ?? 'sofor';
        if (!cancelled) router.replace(`/giris?rol=${rol}`);
        return;
      }

      const profile = await fetchCurrentProfile();

      if (!profile) {
        if (!cancelled) {
          if (pathname !== '/panel/onboarding') {
            router.replace('/panel/onboarding');
          } else {
            setReady(true);
          }
        }
        return;
      }

      if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') {
        if (!cancelled) router.replace('/login');
        return;
      }

      const onSetupPath = SETUP_PATHS.some((p) => pathname.startsWith(p));

      if (needsProfileSetup(profile) && pathname !== '/panel/onboarding') {
        if (!cancelled) router.replace('/panel/onboarding');
        return;
      }

      if (
        !needsProfileSetup(profile) &&
        needsKvkkAcceptance(profile) &&
        pathname !== '/panel/kvkk'
      ) {
        if (!cancelled) router.replace('/panel/kvkk');
        return;
      }

      if (
        !needsProfileSetup(profile) &&
        !needsKvkkAcceptance(profile) &&
        needsAddressSetup(profile) &&
        pathname !== '/panel/address'
      ) {
        if (!cancelled) router.replace('/panel/address');
        return;
      }

      if (
        !needsProfileSetup(profile) &&
        !needsKvkkAcceptance(profile) &&
        !needsAddressSetup(profile) &&
        onSetupPath
      ) {
        if (!cancelled) router.replace('/panel');
        return;
      }

      if (!cancelled) setReady(true);
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

  return <>{children}</>;
}
