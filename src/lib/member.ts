import type { IconName } from '@/components/ui/icons';

export type MemberRole = 'DRIVER' | 'PLATE_OWNER' | 'USER';
export type MemberRoleSlug = 'sofor' | 'oda-uyesi' | 'mal-sahibi' | 'uye';

/** Kullanıcı arayüzünde görünen rol adları (DB enum değişmez). */
export const memberRoleLabels: Record<MemberRole, string> = {
  DRIVER: 'Şoför',
  PLATE_OWNER: 'Oda Üyesi',
  USER: 'Oda Üyesi',
};

const odaUyesiPortalCopy = {
  badge: 'Oda Üyesi Paneli',
  title: 'Oda Üyesi Girişi',
  subtitle: 'E-posta ve şifrenizle giriş yapın; oda üyesi paneliniz açılır.',
} as const;

export interface MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  profileImageUrl: string | null;
  role: MemberRole | 'ADMIN' | 'SUPER_ADMIN';
  status: string;
  kvkkAcceptedAt: string | null;
  city: string | null;
  district: string | null;
  addressLine: string | null;
}

const LOGIN_INTENT_KEY = 'iteo_login_intent';

export const roleSlugToMemberRole: Record<MemberRoleSlug, MemberRole> = {
  sofor: 'DRIVER',
  'oda-uyesi': 'PLATE_OWNER',
  'mal-sahibi': 'PLATE_OWNER',
  uye: 'PLATE_OWNER',
};

export const memberRoleToSlug: Record<MemberRole, MemberRoleSlug> = {
  DRIVER: 'sofor',
  PLATE_OWNER: 'oda-uyesi',
  USER: 'uye',
};

export const loginPortalCopy: Record<
  MemberRoleSlug,
  { badge: string; title: string; subtitle: string }
> = {
  sofor: {
    badge: 'Şoför Paneli',
    title: 'Şoför Girişi',
    subtitle: 'E-posta ve şifrenizle giriş yapın; şoför paneliniz açılır.',
  },
  'oda-uyesi': odaUyesiPortalCopy,
  'mal-sahibi': odaUyesiPortalCopy,
  uye: {
    badge: 'Oda Üyesi Paneli',
    title: 'Oda Üyesi Girişi',
    subtitle: 'E-posta ve şifrenizle giriş yapın; oda üyesi paneliniz açılır.',
  },
};

export const roleDashboardTitles: Record<MemberRole, string> = {
  DRIVER: 'Şoför Paneli',
  PLATE_OWNER: 'Oda Üyesi Paneli',
  USER: 'Oda Üyesi Paneli',
};

/** DB'de kalan USER kayıtlarını da oda üyesi (PLATE_OWNER) paneline yönlendirir. */
export function toMemberRole(role: string | undefined | null): MemberRole {
  if (role === 'DRIVER') return 'DRIVER';
  if (role === 'PLATE_OWNER' || role === 'USER') return 'PLATE_OWNER';
  return 'PLATE_OWNER';
}

export interface MemberNavItem {
  href: string;
  label: string;
  icon: IconName;
  roles: MemberRole[];
  labelByRole?: Partial<Record<MemberRole, string>>;
}

const memberTabHrefs: Record<MemberRole, string[]> = {
  DRIVER: ['/panel', '/panel/finance', '/panel/appointments/hotel', '/panel/announcements'],
  PLATE_OWNER: ['/panel', '/panel/payments', '/panel/vehicles', '/panel/appointments/service'],
  USER: ['/panel', '/panel/payments', '/panel/appointments/hotel', '/panel/announcements'],
};

export const memberNavItems: MemberNavItem[] = [
  { href: '/panel', label: 'Ana Sayfa', icon: 'home', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/profile', label: 'Profilim', icon: 'user', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/finance', label: 'Muhasebe', icon: 'finance', roles: ['DRIVER', 'PLATE_OWNER'] },
  {
    href: '/panel/vehicles',
    label: 'Plakalarım',
    labelByRole: { DRIVER: 'Çalışma Bilgileri' },
    icon: 'taxi',
    roles: ['DRIVER', 'PLATE_OWNER'],
  },
  {
    href: '/panel/marketplace/find-driver',
    label: 'Şoför Bul',
    icon: 'users',
    roles: ['PLATE_OWNER'],
  },
  {
    href: '/panel/marketplace/find-vehicle',
    label: 'Araç Bul',
    icon: 'taxi',
    roles: ['DRIVER'],
  },
  { href: '/panel/announcements', label: 'Duyurular', icon: 'megaphone', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/news', label: 'Haberler', icon: 'news', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/payments', label: 'Ödemeler', icon: 'card', roles: ['PLATE_OWNER', 'USER'] },
  {
    href: '/panel/appointments/hotel',
    label: 'Otel Konaklama',
    icon: 'building',
    roles: ['DRIVER', 'PLATE_OWNER', 'USER'],
  },
  {
    href: '/panel/appointments/service',
    label: 'Servis Randevu',
    icon: 'wrench',
    roles: ['DRIVER', 'PLATE_OWNER', 'USER'],
  },
  { href: '/panel/forgotten-items', label: 'Unutulan Eşya', icon: 'briefcase', roles: ['DRIVER', 'PLATE_OWNER'] },
  { href: '/panel/services/tow', label: 'Çekici', icon: 'taxi', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/services/insurance', label: 'Sigorta', icon: 'shield', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/services/complaint', label: 'Şikayet', icon: 'megaphone', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/services/pirate-report', label: 'Korsan İhbar', icon: 'pin', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/services/petition', label: 'Dilekçe', icon: 'receipt', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/listings', label: 'İlanlar', icon: 'pin', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/ohs', label: 'İSG', icon: 'shield', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/help', label: 'Yardım', icon: 'help', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
];

export function getMemberNavLabel(item: MemberNavItem, role: MemberRole): string {
  return item.labelByRole?.[role] ?? item.label;
}

/** Ana ekran modül ızgarası — mockup sırası (ilk 6 ana modül) */
const memberLauncherOrder: Record<MemberRole, string[]> = {
  DRIVER: [
    '/panel/profile',
    '/panel/finance',
    '/panel/news',
    '/panel/announcements',
    '/panel/ohs',
    '/panel/appointments/hotel',
    '/panel/appointments/service',
    '/panel/vehicles',
    '/panel/marketplace/find-vehicle',
    '/panel/forgotten-items',
    '/panel/listings',
    '/panel/services/tow',
    '/panel/services/insurance',
    '/panel/services/complaint',
    '/panel/services/pirate-report',
    '/panel/services/petition',
    '/panel/help',
  ],
  PLATE_OWNER: [
    '/panel/profile',
    '/panel/payments',
    '/panel/finance',
    '/panel/vehicles',
    '/panel/marketplace/find-driver',
    '/panel/news',
    '/panel/announcements',
    '/panel/ohs',
    '/panel/appointments/hotel',
    '/panel/appointments/service',
    '/panel/listings',
    '/panel/services/tow',
    '/panel/services/insurance',
    '/panel/services/complaint',
    '/panel/services/pirate-report',
    '/panel/services/petition',
    '/panel/help',
  ],
  USER: [
    '/panel/profile',
    '/panel/payments',
    '/panel/news',
    '/panel/announcements',
    '/panel/ohs',
    '/panel/appointments/hotel',
    '/panel/appointments/service',
    '/panel/services/tow',
    '/panel/services/insurance',
    '/panel/services/complaint',
    '/panel/services/pirate-report',
    '/panel/services/petition',
    '/panel/help',
  ],
};

const launcherShortLabels: Record<string, string> = {
  Profilim: 'Profil',
  'Plakalarım': 'Plakalar',
  'Çalışma Bilgileri': 'Plakalar',
  'Unutulan Eşya': 'Eşya',
  'Korsan İhbar': 'İhbar',
  'Otel Konaklama': 'Otel',
  'Servis Randevu': 'Servis',
};

const launcherSubtitles: Record<string, string> = {
  Profilim: 'Hesap ve kişisel bilgiler',
  Muhasebe: 'Gelir, gider ve fiş takibi',
  Haberler: 'Sektör, oda ve gündem haberleri',
  Duyurular: 'Resmi bildirim ve uyarılar',
  İSG: 'Danışman, eğitim ve SSS',
  'Otel Konaklama': 'Oda üyesi konaklama talebi',
  'Servis Randevu': 'Bakım ve onarım randevusu',
  Ödemeler: 'Aidat ve ücretler',
  Plakalarım: 'Plaka kaydı ve araç yönetimi',
  'Çalışma Bilgileri': 'Onaylı çalışma plakalarınız',
  'Şoför Bul': 'Boş plaka için şoför daveti',
  'Araç Bul': 'Boş araçlara başvuru ve davetler',
  'Unutulan Eşya': 'Kayıp eşya bildirimi',
  Çekici: 'Arıza ve kaza çekici talebi',
  Sigorta: 'Poliçe ve yenileme başvurusu',
  Şikayet: 'Şikayet ve geri bildirim',
  'Korsan İhbar': 'Korsan taksi bildirimi',
  Dilekçe: 'Resmi yazılı talep',
  İlanlar: 'Araç kiralama ve plaka satış',
  Yardım: 'SSS ve iletişim',
};

export interface MemberLauncherModule {
  href: string;
  label: string;
  icon: IconName;
  subtitle: string;
}

export function getMemberLauncherModules(role: MemberRole): MemberLauncherModule[] {
  const order = memberLauncherOrder[role];
  return order
    .map((href) => {
      const item = memberNavItems.find((n) => n.href === href);
      if (!item || !item.roles.includes(role)) return null;
      const full = getMemberNavLabel(item, role);
      return {
        href,
        label: launcherShortLabels[full] ?? full,
        icon: item.icon,
        subtitle: launcherSubtitles[full] ?? 'Modüle git',
      };
    })
    .filter((m): m is MemberLauncherModule => m !== null);
}

export function getMemberTabItems(role: MemberRole): MemberNavItem[] {
  const hrefs = memberTabHrefs[role];
  return hrefs
    .map((href) => memberNavItems.find((item) => item.href === href))
    .filter((item): item is MemberNavItem => Boolean(item));
}

export function getMemberOverflowItems(role: MemberRole): MemberNavItem[] {
  const tabHrefs = new Set(memberTabHrefs[role]);
  return memberNavItems.filter(
    (item) => item.roles.includes(role) && item.href !== '/panel' && !tabHrefs.has(item.href),
  );
}

export function getMemberPageTitle(pathname: string, role: MemberRole): string {
  const item = memberNavItems.find((n) => n.href === pathname);
  if (item) return getMemberNavLabel(item, role);
  if (pathname.startsWith('/panel/finance')) return 'Muhasebe';
  if (pathname.startsWith('/panel/appointments/hotel')) return 'Otel Konaklama';
  if (pathname.startsWith('/panel/appointments/service')) return 'Servis Randevu';
  if (pathname.startsWith('/panel/listings/') && pathname !== '/panel/listings') return 'İlan Detayı';
  if (pathname === '/panel/marketplace/find-driver') return 'Şoför Bul';
  if (pathname === '/panel/marketplace/find-vehicle') return 'Araç Bul';
  if (pathname.startsWith('/panel/services/')) {
    const module = memberNavItems.find((n) => n.href === pathname);
    if (module) return getMemberNavLabel(module, role);
  }
  return 'Panel';
}

export function setLoginIntent(role: MemberRoleSlug): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(LOGIN_INTENT_KEY, role);
  }
}

export function getLoginIntent(): MemberRoleSlug | null {
  if (typeof window === 'undefined') return null;
  const value = sessionStorage.getItem(LOGIN_INTENT_KEY);
  if (value === 'sofor' || value === 'oda-uyesi' || value === 'mal-sahibi' || value === 'uye') return value;
  return null;
}

export function getRegistrationRole(): MemberRole {
  const intent = getLoginIntent();
  if (intent) return roleSlugToMemberRole[intent];
  return 'PLATE_OWNER';
}

export function registrationRoleLabel(role: MemberRole): string {
  return roleDashboardTitles[role];
}

export function needsProfileSetup(profile: Pick<MemberProfile, 'firstName' | 'lastName'>): boolean {
  const first = profile.firstName?.trim() ?? '';
  const last = profile.lastName?.trim() ?? '';
  if (!first || !last) return true;
  if (first === 'İTEO' && last === 'Üyesi') return true;
  return false;
}

export function needsKvkkAcceptance(profile: Pick<MemberProfile, 'kvkkAcceptedAt'>): boolean {
  return !profile.kvkkAcceptedAt;
}

export function needsAddressSetup(
  profile: Pick<MemberProfile, 'city' | 'district' | 'addressLine'>,
): boolean {
  return !profile.city?.trim() || !profile.district?.trim() || !profile.addressLine?.trim();
}

export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.';
  }
  if (m.includes('email not confirmed')) {
    return 'E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzu kontrol edin.';
  }
  if (
    m.includes('user already registered') ||
    m.includes('already been registered') ||
    m.includes('already exists')
  ) {
    return 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.';
  }
  if (m.includes('password') && (m.includes('weak') || m.includes('short') || m.includes('least'))) {
    return 'Şifre yeterince güçlü değil. En az 6 karakter kullanın.';
  }
  if (m.includes('invalid api key') || m.includes('api key')) {
    return 'Sunucu yapılandırması eksik (Supabase service role key). Lütfen yöneticinize bildirin.';
  }
  if (m.includes('signup') && m.includes('disabled')) {
    return 'Yeni kayıt şu an kapalı. Lütfen oda ile iletişime geçin.';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.';
  }
  if (process.env.NODE_ENV === 'development' && message.trim()) {
    return message;
  }
  return 'İşlem tamamlanamadı. Lütfen bilgilerinizi kontrol edin.';
}
