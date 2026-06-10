'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  readMemberCockpitTheme,
  storeMemberCockpitTheme,
  type MemberCockpitTheme,
} from '@/lib/member-cockpit-theme';

interface MemberCockpitThemeContextValue {
  theme: MemberCockpitTheme;
  toggleTheme: () => void;
  setTheme: (theme: MemberCockpitTheme) => void;
  ready: boolean;
}

const MemberCockpitThemeContext = createContext<MemberCockpitThemeContextValue | null>(null);

export function MemberCockpitThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<MemberCockpitTheme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setThemeState(readMemberCockpitTheme());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    storeMemberCockpitTheme(theme);
  }, [theme, ready]);

  const setTheme = useCallback((next: MemberCockpitTheme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme, ready }),
    [theme, toggleTheme, setTheme, ready],
  );

  return (
    <MemberCockpitThemeContext.Provider value={value}>{children}</MemberCockpitThemeContext.Provider>
  );
}

export function useMemberCockpitTheme(): MemberCockpitThemeContextValue {
  const ctx = useContext(MemberCockpitThemeContext);
  if (!ctx) {
    throw new Error('useMemberCockpitTheme must be used within MemberCockpitThemeProvider');
  }
  return ctx;
}
