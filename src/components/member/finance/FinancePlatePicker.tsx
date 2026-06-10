'use client';

import Link from 'next/link';
import { IteoIcon } from '@/components/ui/icons';

export interface VehicleOption {
  id: string;
  plateNumber: string;
}

interface Props {
  vehicles: VehicleOption[];
  value: string;
  onChange: (vehicleId: string) => void;
  vehiclesLink?: string;
  vehiclesLinkLabel?: string;
}

export function FinancePlatePicker({
  vehicles,
  value,
  onChange,
  vehiclesLink = '/panel/vehicles',
  vehiclesLinkLabel = 'Plaka / Araçlarım',
}: Props) {
  const selected = vehicles.find((v) => v.id === value);

  return (
    <section className="overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-md">
      <div className="relative flex items-start gap-3 border-b border-white/10 bg-gradient-to-r from-iteo-black to-[#1f1f1f] px-4 py-5 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-iteo-yellow/20">
          <IteoIcon name="taxi" size={22} className="text-iteo-yellow" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-white">Çalışma plakası</h2>
          <p className="mt-0.5 text-sm text-white/65">
            Kayıt ve raporlar seçtiğiniz plakaya göre listelenir.
          </p>
        </div>
        {selected && (
          <span className="hidden rounded-full bg-iteo-yellow px-3 py-1 text-xs font-bold text-iteo-black sm:inline">
            {selected.plateNumber}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {vehicles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-iteo-gray-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-iteo-black">Henüz tanımlı plakanız yok</p>
            <p className="mt-1 text-xs text-iteo-gray-500">
              Muhasebe kaydı oluşturmak için önce plaka ekleyin veya onay bekleyin.
            </p>
            <Link
              href={vehiclesLink}
              className="mt-4 inline-flex items-center gap-1 rounded-lg bg-iteo-yellow px-4 py-2 text-sm font-semibold text-iteo-black hover:bg-iteo-yellow/90">
              {vehiclesLinkLabel} →
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {vehicles.map((v) => {
              const active = value === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onChange(v.id)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-200 ${
                    active
                      ? 'border-iteo-yellow bg-iteo-yellow text-iteo-black shadow-md shadow-iteo-yellow/20 ring-2 ring-iteo-yellow/30'
                      : 'border-iteo-gray-200 bg-white text-iteo-gray-700 hover:border-iteo-yellow/50 hover:bg-iteo-yellow/5'
                  }`}>
                  <IteoIcon name="taxi" size={16} className={active ? 'text-iteo-black' : 'text-iteo-gray-500'} />
                  {v.plateNumber}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
