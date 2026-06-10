'use client';

import { useMemberCockpitTheme } from '@/components/member/MemberCockpitThemeContext';
import {
  actionBtnClass,
  actionGroupClass,
  actionIconAccentClass,
} from '@/components/member/member-cockpit-action-styles';

interface Props {
  onLogout: () => void;
}

export function MemberLauncherHeaderActions({ onLogout }: Props) {
  const { theme, toggleTheme, ready } = useMemberCockpitTheme();
  const isLight = theme === 'light';

  return (
    <div className={actionGroupClass}>
      <button
        type="button"
        onClick={toggleTheme}
        disabled={!ready}
        className={actionBtnClass}
        aria-label={isLight ? 'Koyu moda geç' : 'Açık moda geç'}
        title={isLight ? 'Koyu mod' : 'Açık mod'}
      >
        {isLight ? <IconMoon className={actionIconAccentClass} /> : <IconSun className={actionIconAccentClass} />}
        <span>{isLight ? 'Koyu' : 'Açık'}</span>
      </button>
      <button type="button" onClick={onLogout} className={actionBtnClass}>
        <IconLogout className={actionIconAccentClass} />
        <span>Çıkış</span>
      </button>
    </div>
  );
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
