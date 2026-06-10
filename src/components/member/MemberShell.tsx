'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutSession } from '@/lib/auth/client';
import { getMemberPageTitle, roleDashboardTitles, type MemberRole } from '@/lib/member';
import { IteoIcon } from '@/components/ui/icons';
import { useMemberCockpitTheme } from '@/components/member/MemberCockpitThemeContext';
import { MemberThemeToggle } from '@/components/member/MemberThemeToggle';

interface Props {
  role: MemberRole;
  userName: string;
  children: React.ReactNode;
}

export function MemberShell({ role, userName, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = getMemberPageTitle(pathname, role);
  const isModuleHome = pathname === '/panel';
  const { theme } = useMemberCockpitTheme();

  async function logout() {
    await logoutSession();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isModuleHome && (
        <header className="sticky top-0 z-20 border-b border-iteo-gray-200 bg-white/95 px-4 py-4 backdrop-blur md:px-6">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/panel"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-iteo-yellow text-iteo-black hover:bg-iteo-yellow-dark"
                aria-label="Ana modül ekranına dön"
              >
                <IteoIcon name="home" size={20} />
              </Link>
              <div className="min-w-0">
                <p className="text-xs font-medium text-iteo-gray-500">{roleDashboardTitles[role]}</p>
                <h1 className="truncate text-lg font-bold text-iteo-black">{pageTitle}</h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-iteo-black sm:block">
                {userName}
              </span>
              <MemberThemeToggle variant="shell" showLogout onLogout={logout} />
            </div>
          </div>
        </header>
      )}

      <main
        className={`flex-1 ${
          isModuleHome
            ? theme === 'light'
              ? 'bg-iteo-yellow'
              : 'bg-iteo-black'
            : 'bg-iteo-gray-100 p-4 md:p-6'
        }`}
      >
        {!isModuleHome ? <div className="mx-auto w-full max-w-6xl">{children}</div> : children}
      </main>
    </div>
  );
}
