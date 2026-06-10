import type { IconName } from '@/components/ui/icons';

export type ServiceRequestType = 'TOW' | 'INSURANCE' | 'COMPLAINT' | 'PIRATE_REPORT' | 'PETITION';

export interface ServiceRequest {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  plateNumber: string | null;
  locationAddress: string | null;
  adminNote: string | null;
  createdAt: string;
}

export interface ServiceModuleConfig {
  type: ServiceRequestType;
  slug: string;
  href: string;
  label: string;
  badge: string;
  title: string;
  description: string;
  formTitle: string;
  icon: IconName;
  subtitle: string;
  fields: {
    plate: boolean;
    location: boolean;
  };
}

export const SERVICE_MODULES: ServiceModuleConfig[] = [
  {
    type: 'TOW',
    slug: 'tow',
    href: '/panel/services/tow',
    label: 'Çekici',
    badge: 'Oda Hizmeti',
    title: 'Çekici Talebi',
    description: 'Araç arızası veya kaza durumunda çekici talebinizi odaya iletin.',
    formTitle: 'Yeni Çekici Talebi',
    icon: 'taxi',
    subtitle: 'Arıza ve kaza çekici',
    fields: { plate: true, location: true },
  },
  {
    type: 'INSURANCE',
    slug: 'insurance',
    href: '/panel/services/insurance',
    label: 'Sigorta',
    badge: 'Oda Hizmeti',
    title: 'Sigorta Başvurusu',
    description: 'Sigorta yaptırma, yenileme ve danışmanlık taleplerinizi oluşturun.',
    formTitle: 'Yeni Sigorta Talebi',
    icon: 'shield',
    subtitle: 'Poliçe ve yenileme',
    fields: { plate: true, location: false },
  },
  {
    type: 'COMPLAINT',
    slug: 'complaint',
    href: '/panel/services/complaint',
    label: 'Şikayet',
    badge: 'Oda Hizmeti',
    title: 'Şikayet & Geri Bildirim',
    description: 'Şikayet, öneri ve geri bildirimlerinizi doğrudan odaya iletin.',
    formTitle: 'Yeni Şikayet',
    icon: 'megaphone',
    subtitle: 'Şikayet ve öneri',
    fields: { plate: false, location: false },
  },
  {
    type: 'PIRATE_REPORT',
    slug: 'pirate-report',
    href: '/panel/services/pirate-report',
    label: 'Korsan İhbar',
    badge: 'Oda Hizmeti',
    title: 'Korsan Taksi İhbarı',
    description: 'Korsan taksi faaliyetlerini plaka ve konum bilgisiyle bildirin.',
    formTitle: 'Yeni Korsan İhbarı',
    icon: 'pin',
    subtitle: 'İhbar ve bildirim',
    fields: { plate: true, location: true },
  },
  {
    type: 'PETITION',
    slug: 'petition',
    href: '/panel/services/petition',
    label: 'Dilekçe',
    badge: 'Oda Hizmeti',
    title: 'Dilekçe & Resmi Talep',
    description: 'Resmi dilekçe ve yazılı taleplerinizi dijital ortamda iletin.',
    formTitle: 'Yeni Dilekçe',
    icon: 'receipt',
    subtitle: 'Resmi yazılı talep',
    fields: { plate: false, location: false },
  },
];

export const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  ASSIGNED: 'Atandı',
  IN_PROGRESS: 'İşlemde',
  COMPLETED: 'Tamamlandı',
  REJECTED: 'Reddedildi',
  CANCELLED: 'İptal',
};

export function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'COMPLETED') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'ASSIGNED' || status === 'IN_PROGRESS') return 'info';
  if (status === 'REJECTED' || status === 'CANCELLED') return 'danger';
  return 'neutral';
}

export function getServiceModuleBySlug(slug: string): ServiceModuleConfig | undefined {
  return SERVICE_MODULES.find((m) => m.slug === slug);
}

export function getServiceModuleByHref(href: string): ServiceModuleConfig | undefined {
  return SERVICE_MODULES.find((m) => m.href === href);
}

export const inputClass =
  'w-full rounded-lg border border-iteo-gray-200 px-3 py-2.5 text-sm text-iteo-black placeholder:text-iteo-gray-400 focus:border-iteo-yellow focus:outline-none focus:ring-2 focus:ring-iteo-yellow/30';

export const labelClass = 'text-xs font-semibold uppercase tracking-wide text-iteo-gray-500';
