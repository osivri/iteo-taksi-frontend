export const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/profile', label: 'Profilim', icon: '👤' },
  { href: '/dashboard/users', label: 'Kullanıcılar', icon: '👥' },
  { href: '/dashboard/vehicles', label: 'Plaka / Araç', icon: '🚕' },
  { href: '/dashboard/stands', label: 'Duraklar', icon: '🚏' },
  { href: '/dashboard/service-requests', label: 'Hizmet Talepleri', icon: '📋' },
  { href: '/dashboard/listings', label: 'İlanlar', icon: '📌' },
  { href: '/dashboard/spare-parts', label: 'Yedek Parça', icon: '🔧' },
  { href: '/dashboard/staff-expenses', label: 'Personel Gider', icon: '👔' },
  { href: '/dashboard/announcements', label: 'Duyurular', icon: '📢' },
  { href: '/dashboard/news', label: 'Haberler', icon: '📰' },
  { href: '/dashboard/payments', label: 'Ödemeler', icon: '💳' },
  { href: '/dashboard/fees', label: 'Tarifeler', icon: '💰' },
  { href: '/dashboard/finance', label: 'Muhasebe', icon: '📒' },
  { href: '/dashboard/ohs', label: 'İSG İçerikleri', icon: '🦺' },
  { href: '/dashboard/appointments', label: 'Randevular', icon: '📅' },
  { href: '/dashboard/forgotten-items', label: 'Unutulan Eşya', icon: '🧳' },
  { href: '/dashboard/notifications', label: 'Bildirimler', icon: '🔔' },
  { href: '/dashboard/reminders', label: 'Hatırlatmalar', icon: '⏰' },
  { href: '/dashboard/ratings', label: 'Puanlama', icon: '⭐' },
  { href: '/dashboard/reports', label: 'Raporlar', icon: '📈' },
  { href: '/dashboard/audit-logs', label: 'İşlem Logları', icon: '📝' },
] as const;

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}
