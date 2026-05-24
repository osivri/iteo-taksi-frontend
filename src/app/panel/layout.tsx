'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PanelGate } from '@/components/member/PanelGate';
import { MemberShell } from '@/components/member/MemberShell';
import { fetchCurrentProfile } from '@/lib/member-profile';
import { needsKvkkAcceptance, needsProfileSetup, type MemberProfile, type MemberRole } from '@/lib/member';

const SETUP_PATHS = ['/panel/onboarding', '/panel/kvkk'];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<MemberProfile | null>(null);

  useEffect(() => {
    fetchCurrentProfile().then(setProfile);
  }, [pathname]);

  const isSetupPath = SETUP_PATHS.some((p) => pathname.startsWith(p));

  return (
    <PanelGate>
      {isSetupPath || !profile || needsProfileSetup(profile) || needsKvkkAcceptance(profile) ? (
        children
      ) : (
        <MemberShell
          role={profile.role as MemberRole}
          userName={`${profile.firstName} ${profile.lastName}`}>
          {children}
        </MemberShell>
      )}
    </PanelGate>
  );
}
