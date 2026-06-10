import type { IconName } from '@/components/ui/icons';

export interface AdminNavItem {
  href: string;
  label: string;
  icon: IconName;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: 'Operasyon',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'chart' },
      { href: '/dashboard/users', label: 'Kullanıcılar', icon: 'users' },
      { href: '/dashboard/vehicles', label: 'Plaka / Araç', icon: 'taxi' },
      { href: '/dashboard/stands', label: 'Duraklar', icon: 'pin' },
      { href: '/dashboard/service-requests', label: 'Hizmet Talepleri', icon: 'briefcase' },
      { href: '/dashboard/appointments', label: 'Randevular', icon: 'calendar' },
      { href: '/dashboard/forgotten-items', label: 'Unutulan Eşya', icon: 'briefcase' },
    ],
  },
  {
    title: 'Finans',
    items: [
      { href: '/dashboard/payments', label: 'Ödemeler', icon: 'card' },
      { href: '/dashboard/fees', label: 'Tarifeler', icon: 'receipt' },
      { href: '/dashboard/finance', label: 'Muhasebe', icon: 'finance' },
      { href: '/dashboard/staff-expenses', label: 'Personel Gider', icon: 'user' },
    ],
  },
  {
    title: 'İçerik',
    items: [
      { href: '/dashboard/announcements', label: 'Duyurular', icon: 'megaphone' },
      { href: '/dashboard/news', label: 'Haberler', icon: 'news' },
      { href: '/dashboard/listings', label: 'İlanlar', icon: 'pin' },
      { href: '/dashboard/spare-parts', label: 'Yedek Parça', icon: 'wrench' },
      { href: '/dashboard/ohs', label: 'İSG İçerikleri', icon: 'shield' },
      { href: '/dashboard/ratings', label: 'Puanlama', icon: 'star' },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { href: '/dashboard/profile', label: 'Profilim', icon: 'user' },
      { href: '/dashboard/notifications', label: 'Bildirimler', icon: 'bell' },
      { href: '/dashboard/reminders', label: 'Hatırlatmalar', icon: 'clock' },
      { href: '/dashboard/reports', label: 'Raporlar', icon: 'chart' },
      { href: '/dashboard/audit-logs', label: 'İşlem Logları', icon: 'receipt' },
    ],
  },
];

/** Düz liste — geriye dönük uyumluluk */
export const adminNavItems = adminNavGroups.flatMap((g) => g.items);

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}
