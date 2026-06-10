import type { ReactNode } from 'react';
import type { IconName } from '@/components/ui/icons';

type TileTone = 'on-dark' | 'on-yellow' | 'on-light';

/** Modül kartı arka plan illüstrasyonları */
export function ModuleTileArt({ icon, tone = 'on-dark' }: { icon: IconName; tone?: TileTone }) {
  const palette =
    tone === 'on-yellow' ? paletteOnYellow : tone === 'on-light' ? paletteOnLight : paletteOnDark;
  const art = buildArt(palette)[icon] ?? buildArt(palette).grid;
  const opacityClass =
    tone === 'on-yellow'
      ? 'opacity-[0.14] group-hover:opacity-[0.22]'
      : tone === 'on-light'
        ? 'opacity-[0.07] group-hover:opacity-[0.12]'
        : 'opacity-[0.22] group-hover:opacity-35';
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-300 ${opacityClass}`}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        {art}
      </svg>
    </div>
  );
}

const paletteOnDark = { primary: '#ffc700', secondary: '#e6b300' };
const paletteOnYellow = { primary: '#0a0a0a', secondary: '#262626' };
const paletteOnLight = { primary: '#ffc700', secondary: '#fff3cc' };

function buildArt({ primary, secondary }: { primary: string; secondary: string }): Record<IconName, ReactNode> {
  const yellow = primary;
  const amber = secondary;
  return {
  user: (
    <>
      <circle cx="100" cy="72" r="36" fill={yellow} />
      <ellipse cx="100" cy="168" rx="58" ry="34" fill={yellow} />
    </>
  ),
  finance: (
    <>
      <rect x="36" y="40" width="128" height="120" rx="16" fill={yellow} />
      <rect x="56" y="68" width="88" height="10" rx="4" fill={amber} />
      <rect x="56" y="92" width="72" height="10" rx="4" fill={amber} />
      <rect x="56" y="116" width="48" height="10" rx="4" fill={amber} />
    </>
  ),
  news: (
    <>
      <rect x="40" y="48" width="120" height="104" rx="12" fill={yellow} />
      <rect x="58" y="68" width="84" height="8" rx="3" fill={amber} />
      <rect x="58" y="88" width="84" height="8" rx="3" fill={amber} />
      <rect x="58" y="108" width="56" height="8" rx="3" fill={amber} />
    </>
  ),
  megaphone: (
    <>
      <path d="M48 88 L48 112 L128 140 L128 60 Z" fill={yellow} />
      <rect x="128" y="72" width="12" height="56" rx="4" fill={amber} />
      <path d="M56 112 Q44 124 40 140" stroke={yellow} strokeWidth="10" fill="none" />
    </>
  ),
  shield: (
    <path d="M100 36 L52 56 V108 Q52 148 100 168 Q148 148 148 108 V56 Z" fill={yellow} />
  ),
  calendar: (
    <>
      <rect x="44" y="52" width="112" height="108" rx="14" fill={yellow} />
      <rect x="44" y="72" width="112" height="20" fill={amber} />
      <circle cx="76" cy="118" r="10" fill={amber} />
      <circle cx="100" cy="118" r="10" fill={amber} />
      <circle cx="124" cy="118" r="10" fill={amber} />
    </>
  ),
  taxi: (
    <>
      <path d="M32 120 H168 L152 72 H48 Z" fill={yellow} />
      <rect x="72" y="56" width="56" height="20" rx="6" fill={amber} />
      <circle cx="64" cy="132" r="16" fill={yellow} />
      <circle cx="136" cy="132" r="16" fill={yellow} />
      <rect x="88" y="80" width="24" height="8" rx="2" fill={amber} />
    </>
  ),
  card: (
    <>
      <rect x="32" y="72" width="136" height="88" rx="14" fill={yellow} />
      <rect x="32" y="96" width="136" height="18" fill={amber} />
      <rect x="48" y="128" width="48" height="10" rx="3" fill={amber} />
    </>
  ),
  briefcase: (
    <>
      <rect x="48" y="80" width="104" height="80" rx="12" fill={yellow} />
      <path d="M72 80 V64 Q100 48 128 64 V80" stroke={yellow} strokeWidth="14" fill="none" />
    </>
  ),
  bell: (
    <>
      <path d="M100 44 C72 44 60 72 60 96 L44 128 H156 L140 96 C140 72 128 44 100 44Z" fill={yellow} />
      <circle cx="100" cy="148" r="12" fill={amber} />
    </>
  ),
  pin: (
    <>
      <path d="M100 40 C72 40 52 72 52 100 C52 132 100 168 100 168 C100 168 148 132 148 100 C148 72 128 40 100 40Z" fill={yellow} />
      <circle cx="100" cy="100" r="20" fill={amber} />
    </>
  ),
  help: (
    <>
      <circle cx="100" cy="100" r="64" fill={yellow} />
      <text x="100" y="118" textAnchor="middle" fontSize="72" fontWeight="900" fill={amber}>?</text>
    </>
  ),
  home: <rect x="48" y="64" width="104" height="96" rx="12" fill={yellow} />,
  grid: <rect x="40" y="40" width="120" height="120" rx="20" fill={yellow} />,
  building: <path d="M56 160 V56 H144 V160 H120 V112 H80 V160 Z" fill={yellow} />,
  chart: <rect x="48" y="48" width="104" height="104" rx="12" fill={yellow} />,
  users: <circle cx="100" cy="100" r="52" fill={yellow} />,
  wrench: <rect x="60" y="60" width="80" height="80" rx="8" fill={yellow} transform="rotate(45 100 100)" />,
  star: <path d="M100 44 L116 92 H168 L126 124 L142 172 L100 140 L58 172 L74 124 L32 92 H84 Z" fill={yellow} />,
  clock: <circle cx="100" cy="100" r="56" fill={yellow} />,
  receipt: <rect x="52" y="40" width="96" height="128" rx="8" fill={yellow} />,
  };
}
