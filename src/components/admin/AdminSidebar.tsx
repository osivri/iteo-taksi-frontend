'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useState } from 'react';
import { adminNavGroups, isAdminNavActive } from '@/components/admin/admin-nav';
import { IteoIcon, IconClose } from '@/components/ui/icons';

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('AdminSidebarProvider gerekli');
  return ctx;
}

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <SidebarContext.Provider value={{ open, setOpen }}>{children}</SidebarContext.Provider>;
}

function navLinkClass(active: boolean) {
  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
    active
      ? 'bg-iteo-yellow/20 font-medium text-iteo-yellow'
      : 'text-white/80 hover:bg-white/10 hover:text-white'
  }`;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {adminNavGroups.map((group) => (
        <div key={group.title} className="mb-4 last:mb-0">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isAdminNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={navLinkClass(active)}
                >
                  <IteoIcon name={item.icon} size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export function AdminMobileNavButton() {
  const { setOpen } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Menüyü aç"
      onClick={() => setOpen(true)}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-iteo-gray-200 text-iteo-black hover:bg-iteo-gray-100 md:hidden"
    >
      <IteoIcon name="grid" size={20} />
    </button>
  );
}

export function AdminSidebar() {
  const { open, setOpen } = useSidebar();

  return (
    <>
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-iteo-black text-white md:flex">
        <div className="flex items-center gap-3 border-b border-white/10 p-5">
          <Image src="/iteo_logo.jpeg" alt="İTEO Logo" width={44} height={44} className="rounded-xl" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-iteo-yellow">İTEO</p>
            <p className="text-sm font-medium">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </nav>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-iteo-black text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <Image src="/iteo_logo.jpeg" alt="İTEO" width={36} height={36} className="rounded-lg" />
                <p className="text-sm font-medium">Admin Panel</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-white/70 hover:bg-white/10"
              >
                <IconClose size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              <NavLinks onNavigate={() => setOpen(false)} />
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
