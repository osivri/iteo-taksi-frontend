export type MemberRole = 'DRIVER' | 'PLATE_OWNER' | 'USER';
export type MemberRoleSlug = 'sofor' | 'mal-sahibi' | 'uye';

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
}

const LOGIN_INTENT_KEY = 'iteo_login_intent';

export const roleSlugToMemberRole: Record<MemberRoleSlug, MemberRole> = {
  sofor: 'DRIVER',
  'mal-sahibi': 'PLATE_OWNER',
  uye: 'USER',
};

export const memberRoleToSlug: Record<MemberRole, MemberRoleSlug> = {
  DRIVER: 'sofor',
  PLATE_OWNER: 'mal-sahibi',
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
  'mal-sahibi': {
    badge: 'Mal Sahibi Paneli',
    title: 'Mal / Plaka Sahibi Girişi',
    subtitle: 'E-posta ve şifrenizle giriş yapın; plaka sahibi paneliniz açılır.',
  },
  uye: {
    badge: 'Üye Paneli',
    title: 'Oda Üyesi Girişi',
    subtitle: 'E-posta ve şifrenizle giriş yapın; üye paneliniz açılır.',
  },
};

export const roleDashboardTitles: Record<MemberRole, string> = {
  DRIVER: 'Şoför Paneli',
  PLATE_OWNER: 'Plaka Sahibi Paneli',
  USER: 'Üye Paneli',
};

export interface MemberNavItem {
  href: string;
  label: string;
  icon: string;
  roles: MemberRole[];
  labelByRole?: Partial<Record<MemberRole, string>>;
}

export const memberNavItems: MemberNavItem[] = [
  { href: '/panel', label: 'Ana Sayfa', icon: '🏠', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/profile', label: 'Profilim', icon: '👤', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/finance', label: 'Muhasebe', icon: '📒', roles: ['DRIVER', 'PLATE_OWNER'] },
  {
    href: '/panel/vehicles',
    label: 'Plakalarım',
    labelByRole: { DRIVER: 'Çalışma Bilgileri' },
    icon: '🚕',
    roles: ['DRIVER', 'PLATE_OWNER'],
  },
  { href: '/panel/announcements', label: 'Duyurular', icon: '📢', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/news', label: 'Haberler', icon: '📰', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/payments', label: 'Ödemeler', icon: '💳', roles: ['PLATE_OWNER', 'USER'] },
  { href: '/panel/appointments', label: 'Randevu', icon: '📅', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/forgotten-items', label: 'Unutulan Eşya', icon: '🧳', roles: ['DRIVER', 'PLATE_OWNER'] },
  { href: '/panel/ohs', label: 'İSG', icon: '🦺', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
  { href: '/panel/help', label: 'Yardım', icon: '❓', roles: ['DRIVER', 'PLATE_OWNER', 'USER'] },
];

export function getMemberNavLabel(item: MemberNavItem, role: MemberRole): string {
  return item.labelByRole?.[role] ?? item.label;
}

export function setLoginIntent(role: MemberRoleSlug): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(LOGIN_INTENT_KEY, role);
  }
}

export function getLoginIntent(): MemberRoleSlug | null {
  if (typeof window === 'undefined') return null;
  const value = sessionStorage.getItem(LOGIN_INTENT_KEY);
  if (value === 'sofor' || value === 'mal-sahibi' || value === 'uye') return value;
  return null;
}

export function getRegistrationRole(): MemberRole {
  const intent = getLoginIntent();
  if (intent) return roleSlugToMemberRole[intent];
  return 'USER';
}

export function registrationRoleLabel(role: MemberRole): string {
  return roleDashboardTitles[role];
}

export function needsProfileSetup(profile: Pick<MemberProfile, 'firstName' | 'lastName'>): boolean {
  const first = profile.firstName?.trim() ?? '';
  const last = profile.lastName?.trim() ?? '';
  if (!first || !last) return true;
  // Supabase trigger varsayılan profil adı — onboarding gerekli
  if (first === 'İTEO' && last === 'Üyesi') return true;
  return false;
}

export function needsKvkkAcceptance(profile: Pick<MemberProfile, 'kvkkAcceptedAt'>): boolean {
  return !profile.kvkkAcceptedAt;
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
