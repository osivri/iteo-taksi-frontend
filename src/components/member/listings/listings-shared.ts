import type { StatusTone } from '@/components/ui/DesignSystem';

export interface Listing {
  id: string;
  userId?: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  price: number;
  district: string | null;
  neighborhood: string | null;
  photos: string[];
  contactPhone: string | null;
  brand: string | null;
  model: string | null;
  vehicleYear: number | null;
  plateNumber: string | null;
  mileage: number | null;
  fuelType: string | null;
  damageInfo: string | null;
  adminNote: string | null;
  createdAt: string;
  isOwner?: boolean;
}

export type ListingTab = 'browse' | 'create' | 'mine';
export type ListingTypeFilter = 'ALL' | 'VEHICLE_RENTAL' | 'PLATE_SALE';
export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export const typeLabels: Record<string, string> = {
  VEHICLE_RENTAL: 'Araç Kiralama',
  PLATE_SALE: 'Plaka Satış',
};

export const fuelTypeOptions = [
  { value: '', label: 'Seçiniz' },
  { value: 'Benzin', label: 'Benzin' },
  { value: 'Dizel', label: 'Dizel' },
  { value: 'LPG', label: 'LPG' },
  { value: 'Elektrik', label: 'Elektrik' },
  { value: 'Hibrit', label: 'Hibrit' },
] as const;

export function formatVehicleSummary(listing: Pick<Listing, 'brand' | 'model' | 'vehicleYear' | 'plateNumber'>) {
  const parts: string[] = [];
  if (listing.brand) parts.push(listing.brand);
  if (listing.model) parts.push(listing.model);
  if (listing.vehicleYear) parts.push(String(listing.vehicleYear));
  if (listing.plateNumber) parts.push(listing.plateNumber);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function hasVehicleDetails(
  listing: Pick<Listing, 'brand' | 'model' | 'vehicleYear' | 'plateNumber' | 'mileage' | 'fuelType' | 'damageInfo'>,
) {
  return Boolean(
    listing.brand ||
      listing.model ||
      listing.vehicleYear ||
      listing.plateNumber ||
      listing.mileage ||
      listing.fuelType ||
      listing.damageInfo,
  );
}

export const statusLabels: Record<string, string> = {
  PENDING: 'Onay Bekliyor',
  APPROVED: 'Onaylı',
  REJECTED: 'Reddedildi',
};

export function statusTone(status: string): StatusTone {
  if (status === 'APPROVED') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'REJECTED') return 'danger';
  return 'neutral';
}

export function formatPrice(price: number) {
  return `${price.toLocaleString('tr-TR')} ₺`;
}

export function formatLocation(listing: Pick<Listing, 'district' | 'neighborhood'>) {
  const parts = [listing.district, listing.neighborhood].filter(Boolean);
  return parts.length > 0 ? parts.join(' / ') : 'Konum belirtilmedi';
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function sortListings(items: Listing[], sort: SortOption): Listing[] {
  const list = [...items];
  if (sort === 'price_asc') return list.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') return list.sort((a, b) => b.price - a.price);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function filterListingsClient(
  items: Listing[],
  opts: {
    search: string;
    minPrice: string;
    maxPrice: string;
  },
): Listing[] {
  let list = items;
  const q = opts.search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.description?.toLowerCase().includes(q) ?? false) ||
        (i.district?.toLowerCase().includes(q) ?? false) ||
        (i.neighborhood?.toLowerCase().includes(q) ?? false) ||
        (i.brand?.toLowerCase().includes(q) ?? false) ||
        (i.model?.toLowerCase().includes(q) ?? false) ||
        (i.plateNumber?.toLowerCase().includes(q) ?? false),
    );
  }
  const min = opts.minPrice ? Number(opts.minPrice) : null;
  const max = opts.maxPrice ? Number(opts.maxPrice) : null;
  if (min != null && !Number.isNaN(min)) list = list.filter((i) => i.price >= min);
  if (max != null && !Number.isNaN(max)) list = list.filter((i) => i.price <= max);
  return list;
}

export const inputClass =
  'w-full rounded-lg border border-iteo-gray-200 px-3 py-2.5 text-sm text-iteo-black placeholder:text-iteo-gray-400 focus:border-iteo-yellow focus:outline-none focus:ring-2 focus:ring-iteo-yellow/30';

export const labelClass = 'text-xs font-semibold uppercase tracking-wide text-iteo-gray-500';
