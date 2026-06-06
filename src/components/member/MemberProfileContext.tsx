'use client';

import { createContext, useContext } from 'react';
import type { MemberProfile } from '@/lib/member';

const MemberProfileContext = createContext<MemberProfile | null>(null);

export function MemberProfileProvider({
  profile,
  children,
}: {
  profile: MemberProfile | null;
  children: React.ReactNode;
}) {
  return (
    <MemberProfileContext.Provider value={profile}>{children}</MemberProfileContext.Provider>
  );
}

export function useMemberProfileContext(): MemberProfile | null {
  return useContext(MemberProfileContext);
}
