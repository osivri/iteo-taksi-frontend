'use client';

import { usePathname } from 'next/navigation';
import { PanelGate } from '@/components/member/PanelGate';
import { MemberShell } from '@/components/member/MemberShell';
import { useMemberProfileContext } from '@/components/member/MemberProfileContext';
import { needsAddressSetup, needsKvkkAcceptance, needsProfileSetup, type MemberRole } from '@/lib/member';

const SETUP_PATHS = ['/panel/onboarding', '/panel/kvkk', '/panel/address'];

function PanelLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const profile = useMemberProfileContext();
  const isSetupPath = SETUP_PATHS.some((p) => pathname.startsWith(p));

  if (
    isSetupPath ||
    !profile ||
    needsProfileSetup(profile) ||
    needsKvkkAcceptance(profile) ||
    needsAddressSetup(profile)
  ) {
    return children;
  }

  return (
    <MemberShell
      role={profile.role as MemberRole}
      userName={`${profile.firstName} ${profile.lastName}`}>
      {children}
    </MemberShell>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelGate>
      <PanelLayoutContent>{children}</PanelLayoutContent>
    </PanelGate>
  );
}
