import type { StatusTone } from '@/components/ui/DesignSystem';

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  status: string;
  activeDriverId?: string | null;
}

export interface PlateRequest {
  id: string;
  plateNumber: string;
  status: string;
  initiatedBy?: string;
  driverName?: string;
  ownerName?: string;
  createdAt: string;
}

export interface AvailableVehicle {
  id: string;
  plateNumber: string;
  brand: string | null;
  model: string | null;
  ownerName: string;
  hasPendingRequest: boolean;
}

export interface AvailableDriver {
  id: string;
  fullName: string;
  memberNo: string | null;
  phone: string | null;
}

export const requestStatusLabels: Record<string, string> = {
  PENDING: 'Onay bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  CANCELLED: 'İptal',
};

export const vehicleStatusLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  PASSIVE: 'Pasif',
};

export function requestStatusTone(status: string): StatusTone {
  if (status === 'APPROVED') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'REJECTED' || status === 'CANCELLED') return 'danger';
  return 'neutral';
}

export function vehicleStatusTone(vehicle: Vehicle): StatusTone {
  if (vehicle.status !== 'ACTIVE') return 'neutral';
  return vehicle.activeDriverId ? 'success' : 'warning';
}

export const inputClass =
  'w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-sm text-iteo-black placeholder:text-iteo-gray-400 focus:border-iteo-yellow focus:outline-none focus:ring-2 focus:ring-iteo-yellow/30';

export const labelClass = 'text-xs font-semibold uppercase tracking-wide text-iteo-gray-500';
