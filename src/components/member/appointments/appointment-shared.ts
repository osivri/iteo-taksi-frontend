export interface Appointment {
  id: string;
  type: string;
  status: string;
  requestedDate: string;
  requestedTime: string | null;
  description: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  guestCount: number | null;
  roomType: string | null;
  plateNumber: string | null;
  serviceType: string | null;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
}

export const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};
