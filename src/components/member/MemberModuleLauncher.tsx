'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutSession } from '@/lib/auth/client';
import { getMemberLauncherModules, roleDashboardTitles, type MemberRole } from '@/lib/member';
import { IteoIcon } from '@/components/ui/icons';
import { ModuleTileArt } from '@/components/member/ModuleTileArt';
import { useMemberCockpitTheme } from '@/components/member/MemberCockpitThemeContext';
import { MemberLauncherHeaderActions } from '@/components/member/MemberLauncherHeaderActions';
import type { MemberLauncherModule } from '@/lib/member';
import type { MemberCockpitTheme } from '@/lib/member-cockpit-theme';

interface Props {
  role: MemberRole;
  firstName: string;
  lastName: string;
}

export function MemberModuleLauncher({ role, firstName, lastName }: Props) {
  const router = useRouter();
  const { theme } = useMemberCockpitTheme();
  const isLight = theme === 'light';
  const modules = getMemberLauncherModules(role);
  const primary = modules.slice(0, 6);
  const extra = modules.slice(6);

  async function logout() {
    await logoutSession();
    router.push('/');
    router.refresh();
  }

  return (
    <div
      className={
        isLight
          ? 'relative min-h-screen overflow-hidden bg-gradient-to-br from-iteo-yellow via-[#ffd633] to-[#f0b800]'
          : 'relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050505] via-iteo-black to-[#1a1a1a]'
      }
    >
      <LauncherBackground theme={theme} />

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-6 sm:px-8 lg:px-12">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="/iteo_logo.jpeg"
              alt="İTEO"
              width={64}
              height={64}
              className={
                isLight
                  ? 'rounded-2xl shadow-lg ring-2 ring-iteo-black/10'
                  : 'rounded-2xl shadow-lg ring-2 ring-iteo-yellow/40'
              }
              priority
            />
            <div>
              <p
                className={
                  isLight
                    ? 'text-xs font-bold uppercase tracking-[0.2em] text-iteo-black/70'
                    : 'text-xs font-bold uppercase tracking-[0.2em] text-iteo-yellow/80'
                }
              >
                {roleDashboardTitles[role]}
              </p>
              <p
                className={
                  isLight ? 'text-sm font-semibold text-iteo-black/80' : 'text-sm font-semibold text-white/70'
                }
              >
                İstanbul Taksiciler Esnaf Odası
              </p>
            </div>
          </div>
          <MemberLauncherHeaderActions onLogout={logout} />
        </header>

        <section className="mx-auto mt-8 w-full max-w-6xl flex-1 pb-8">
          <div className="mb-8 max-w-2xl">
            <h1
              className={
                isLight
                  ? 'text-3xl font-black tracking-tight text-iteo-black sm:text-4xl lg:text-5xl'
                  : 'text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl'
              }
            >
              Hoşgeldiniz, {firstName} {lastName}
            </h1>
            <p
              className={
                isLight
                  ? 'mt-4 max-w-lg text-base text-iteo-black/70 sm:text-lg'
                  : 'mt-4 max-w-lg text-base text-white/55 sm:text-lg'
              }
            >
              Kullanmak istediğiniz modülü seçin. Her kart ayrı bir hizmet alanına götürür.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6">
            {primary.map((mod, i) => (
              <ModuleTile key={mod.href} mod={mod} featured={i < 3} theme={theme} />
            ))}
          </div>

          {extra.length > 0 && (
            <>
              <p
                className={
                  isLight
                    ? 'mb-4 mt-10 text-sm font-bold uppercase tracking-wider text-iteo-black/50'
                    : 'mb-4 mt-10 text-sm font-bold uppercase tracking-wider text-iteo-yellow/60'
                }
              >
                Diğer hizmetler
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
                {extra.map((mod) => (
                  <ModuleTile key={mod.href} mod={mod} compact theme={theme} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function ModuleTile({
  mod,
  featured = false,
  compact = false,
  theme,
}: {
  mod: MemberLauncherModule;
  featured?: boolean;
  compact?: boolean;
  theme: MemberCockpitTheme;
}) {
  const isLight = theme === 'light';

  const sizeClass = compact
    ? 'min-h-[120px] sm:min-h-[132px]'
    : featured
      ? 'min-h-[168px] sm:min-h-[200px] lg:min-h-[220px]'
      : 'min-h-[148px] sm:min-h-[176px]';

  if (isLight) {
    return (
      <Link
        href={mod.href}
        className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-iteo-black via-iteo-black-soft to-[#262626] shadow-lg shadow-iteo-black/25 ring-1 ring-iteo-black/40 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-iteo-black/35 hover:ring-iteo-yellow/40 active:scale-[0.98] ${sizeClass}`}
      >
        <ModuleTileArt icon={mod.icon} tone="on-dark" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
        <TileContent mod={mod} compact={compact} featured={featured} variant="light" />
        <HoverBadge variant="light" />
      </Link>
    );
  }

  return (
    <Link
      href={mod.href}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-iteo-yellow via-[#ffd633] to-[#f0b800] shadow-lg shadow-iteo-yellow/10 ring-1 ring-iteo-yellow/50 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-iteo-yellow/25 hover:ring-iteo-black/20 active:scale-[0.98] ${sizeClass}`}
    >
      <ModuleTileArt icon={mod.icon} tone="on-yellow" />
      <div className="absolute inset-0 bg-gradient-to-t from-iteo-black/10 via-transparent to-white/10" />
      <TileContent mod={mod} compact={compact} featured={featured} variant="dark" />
      <HoverBadge variant="dark" />
    </Link>
  );
}

function TileContent({
  mod,
  compact,
  featured,
  variant,
}: {
  mod: MemberLauncherModule;
  compact: boolean;
  featured: boolean;
  variant: MemberCockpitTheme;
}) {
  const isLight = variant === 'light';

  return (
    <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
      <div
        className={`flex items-center justify-center rounded-2xl backdrop-blur-sm transition ${
          isLight
            ? 'bg-iteo-yellow/15 ring-1 ring-iteo-yellow/25 group-hover:bg-iteo-yellow/25 group-hover:ring-iteo-yellow/40'
            : 'bg-iteo-black/10 ring-1 ring-iteo-black/15 group-hover:bg-iteo-black/15 group-hover:ring-iteo-black/25'
        } ${compact ? 'h-10 w-10' : featured ? 'h-14 w-14' : 'h-12 w-12'}`}
      >
        <IteoIcon
          name={mod.icon}
          size={compact ? 20 : featured ? 28 : 24}
          className={isLight ? 'text-iteo-yellow' : 'text-iteo-black'}
        />
      </div>
      <div>
        <p
          className={`font-black leading-tight ${
            isLight ? 'text-white' : 'text-iteo-black'
          } ${compact ? 'text-sm sm:text-base' : featured ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}
        >
          {mod.label}
        </p>
        {!compact && (
          <p
            className={`mt-1 line-clamp-2 text-xs sm:text-sm ${
              isLight ? 'text-white/55' : 'text-iteo-black/60'
            }`}
          >
            {mod.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function HoverBadge({ variant }: { variant: MemberCockpitTheme }) {
  const isLight = variant === 'light';
  return (
    <div
      className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide opacity-0 transition group-hover:opacity-100 ${
        isLight ? 'bg-iteo-yellow text-iteo-black' : 'bg-iteo-black text-iteo-yellow'
      }`}
    >
      Aç
    </div>
  );
}

function LauncherBackground({ theme }: { theme: MemberCockpitTheme }) {
  const isLight = theme === 'light';

  if (isLight) {
    return (
      <>
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-iteo-black/5 blur-3xl" aria-hidden />
        <svg
          className="pointer-events-none absolute bottom-8 right-8 hidden h-48 w-48 text-iteo-black/[0.06] lg:block"
          viewBox="0 0 200 120"
          fill="currentColor"
          aria-hidden
        >
          <path d="M20 80 H180 L165 40 H35 Z" />
          <circle cx="55" cy="88" r="14" />
          <circle cx="145" cy="88" r="14" />
          <rect x="85" y="48" width="30" height="10" rx="3" />
        </svg>
      </>
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-iteo-yellow/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-iteo-yellow/10 blur-3xl" aria-hidden />
      <svg
        className="pointer-events-none absolute bottom-8 right-8 hidden h-48 w-48 text-iteo-yellow/[0.08] lg:block"
        viewBox="0 0 200 120"
        fill="currentColor"
        aria-hidden
      >
        <path d="M20 80 H180 L165 40 H35 Z" />
        <circle cx="55" cy="88" r="14" />
        <circle cx="145" cy="88" r="14" />
        <rect x="85" y="48" width="30" height="10" rx="3" />
      </svg>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffc700 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />
    </>
  );
}
