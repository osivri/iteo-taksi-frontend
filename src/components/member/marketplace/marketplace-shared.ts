import type { AvailableDriver, AvailableVehicle } from '@/components/member/vehicles/vehicles-shared';

export const marketplaceSteps = {
  findDriver: [
    { step: '1', title: 'Plaka seçin', desc: 'Şoför aradığınız boş plakayı belirleyin.' },
    { step: '2', title: 'Şoförleri inceleyin', desc: 'Boşta olan onaylı şoförleri listeleyin.' },
    { step: '3', title: 'Davet gönderin', desc: 'Uygun adaya davet iletin; kabul edince eşleşme tamamlanır.' },
  ],
  findVehicle: [
    { step: '1', title: 'Araçları keşfedin', desc: 'Şoför arayan kayıtlı plakaları görüntüleyin.' },
    { step: '2', title: 'Başvurun', desc: 'Uygun araca tek tıkla başvuru gönderin.' },
    { step: '3', title: 'Onay bekleyin', desc: 'Oda üyesi onayladığında plakada çalışmaya başlarsınız.' },
  ],
} as const;

export function filterDrivers(drivers: AvailableDriver[], query: string): AvailableDriver[] {
  const q = query.trim().toLowerCase();
  if (!q) return drivers;
  return drivers.filter(
    (d) =>
      d.fullName.toLowerCase().includes(q) ||
      (d.memberNo?.toLowerCase().includes(q) ?? false) ||
      (d.phone?.toLowerCase().includes(q) ?? false),
  );
}

export function filterVehicles(vehicles: AvailableVehicle[], query: string): AvailableVehicle[] {
  const q = query.trim().toLowerCase();
  if (!q) return vehicles;
  return vehicles.filter(
    (v) =>
      v.plateNumber.toLowerCase().includes(q) ||
      (v.brand?.toLowerCase().includes(q) ?? false) ||
      (v.model?.toLowerCase().includes(q) ?? false) ||
      v.ownerName.toLowerCase().includes(q),
  );
}

export const inputClass =
  'w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-sm text-iteo-black placeholder:text-iteo-gray-400 focus:border-iteo-yellow focus:outline-none focus:ring-2 focus:ring-iteo-yellow/30';
