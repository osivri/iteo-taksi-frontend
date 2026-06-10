'use client';

import Link from 'next/link';
import { EmptyState, SectionCard } from '@/components/admin/AdminUi';
import { IteoIcon } from '@/components/ui/icons';
import type { Vehicle } from './vehicles-shared';
import { vehicleStatusLabels } from './vehicles-shared';

interface Props {
  vehicles: Vehicle[];
}

export function DriverVehiclesView({ vehicles }: Props) {
  return (
    <div className="space-y-6">
      <Link
        href="/panel/marketplace/find-vehicle"
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-iteo-yellow/40 bg-gradient-to-r from-iteo-yellow/20 to-iteo-yellow/5 p-5 transition hover:border-iteo-yellow"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-iteo-black text-iteo-yellow">
            <IteoIcon name="taxi" size={24} />
          </div>
          <div>
            <p className="font-bold text-iteo-black">Araç Bul</p>
            <p className="text-sm text-iteo-gray-600">
              Boş araçlara başvurun, gelen davetleri yönetin ve eşleşme taleplerinizi takip edin
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-iteo-black">
          Modüle git
          <IteoIcon name="pin" size={14} />
        </span>
      </Link>

      <SectionCard
        title="Onaylı çalışma plakalarım"
        description={
          vehicles.length > 0
            ? `${vehicles.length} plakada çalışma yetkiniz var`
            : 'Henüz onaylı plakanız yok — Araç Bul modülünden başvurun'
        }
      >
        {vehicles.length === 0 ? (
          <EmptyState
            icon="taxi"
            title="Onaylı plaka yok"
            description="Araç Bul modülünden boş plakalara başvurabilir veya gelen davetleri kabul edebilirsiniz."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <li
                key={v.id}
                className="rounded-xl border border-iteo-success/30 bg-iteo-success-light p-4"
              >
                <div className="flex items-center gap-2">
                  <IteoIcon name="taxi" size={18} className="text-iteo-success" />
                  <p className="font-bold text-iteo-black">{v.plateNumber}</p>
                </div>
                <p className="mt-1 text-sm text-iteo-success">
                  Onaylı · {vehicleStatusLabels[v.status] ?? v.status}
                </p>
                {(v.brand || v.model) && (
                  <p className="mt-1 text-xs text-iteo-gray-500">
                    {[v.brand, v.model].filter(Boolean).join(' ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
