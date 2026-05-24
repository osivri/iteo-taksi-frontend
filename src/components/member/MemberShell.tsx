'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { memberNavItems, getMemberNavLabel, roleDashboardTitles, type MemberRole } from '@/lib/member';

interface Props {
  role: MemberRole;
  userName: string;
  children: React.ReactNode;
}

export function MemberShell({ role, userName, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleNav = memberNavItems.filter((item) => item.roles.includes(role));

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  function navLinkClass(active: boolean) {
    return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
      active ? 'bg-iteo-yellow/15 text-iteo-yellow' : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-shrink-0 flex-col bg-iteo-black text-white md:flex">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <Image src="/iteo_logo.jpeg" alt="İTEO" width={40} height={40} className="rounded-lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-iteo-yellow">İTEO</p>
              <p className="text-sm font-medium">{roleDashboardTitles[role]}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={navLinkClass(active)}>
                <span aria-hidden>{item.icon}</span>
                {getMemberNavLabel(item, role)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-iteo-gray-200 bg-white px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-iteo-gray-500">{roleDashboardTitles[role]}</p>
              <Link href="/panel/profile" className="font-semibold text-iteo-black hover:text-iteo-yellow">
                {userName}
              </Link>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-iteo-gray-200 px-3 py-1.5 text-sm text-iteo-gray-500 hover:bg-iteo-gray-100">
              Çıkış
            </button>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {visibleNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                    active
                      ? 'bg-iteo-yellow text-iteo-black'
                      : 'bg-iteo-gray-100 text-iteo-gray-600'
                  }`}>
                  {item.icon} {getMemberNavLabel(item, role)}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="flex-1 bg-iteo-gray-100 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
