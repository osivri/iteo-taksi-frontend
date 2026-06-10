'use client';

import Link from 'next/link';
import { FormEvent } from 'react';
import { EmptyState, SectionCard } from '@/components/admin/AdminUi';
import { IteoIcon } from '@/components/ui/icons';
import { StatusBadge } from '@/components/ui/DesignSystem';
import type { Vehicle } from './vehicles-shared';
import { inputClass, labelClass, vehicleStatusLabels, vehicleStatusTone } from './vehicles-shared';

interface Props {
  vehicles: Vehicle[];
  plateNumber: string;
  brand: string;
  model: string;
  saving: boolean;
  actionId: string | null;
  onPlateNumberChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onRemove: (id: string) => void;
}

export function OwnerVehiclesView({
  vehicles,
  plateNumber,
  brand,
  model,
  saving,
  actionId,
  onPlateNumberChange,
  onBrandChange,
  onModelChange,
  onSubmit,
  onRemove,
}: Props) {
  const driverlessOwnerVehicles = vehicles.filter((v) => v.status === 'ACTIVE' && !v.activeDriverId);
  const seekingDriverCount = driverlessOwnerVehicles.length;

  return (
    <div className="space-y-6">
      <Link
        href="/panel/marketplace/find-driver"
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-iteo-yellow/40 bg-gradient-to-r from-iteo-yellow/20 to-iteo-yellow/5 p-5 transition hover:border-iteo-yellow"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-iteo-black text-iteo-yellow">
            <IteoIcon name="users" size={24} />
          </div>
          <div>
            <p className="font-bold text-iteo-black">Şoför Bul</p>
            <p className="text-sm text-iteo-gray-600">
              {seekingDriverCount > 0
                ? `${seekingDriverCount} boş plaka için şoför arayın veya başvuruları yönetin`
                : 'Boş plakanız için onaylı şoförlere davet gönderin'}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-iteo-black">
          Modüle git
          <IteoIcon name="pin" size={14} />
        </span>
      </Link>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <div className="xl:sticky xl:top-24">
            <SectionCard title="Yeni plaka ekle" description="Aracınızı odaya kaydedin">
              <form onSubmit={onSubmit} className="space-y-4">
                <label className="block space-y-1.5">
                  <span className={labelClass}>Plaka *</span>
                  <input
                    type="text"
                    placeholder="34 ABC 123"
                    value={plateNumber}
                    onChange={(e) => onPlateNumberChange(e.target.value.toUpperCase())}
                    required
                    className={`${inputClass} uppercase font-semibold tracking-wide`}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className={labelClass}>Marka</span>
                    <input
                      type="text"
                      placeholder="Opsiyonel"
                      value={brand}
                      onChange={(e) => onBrandChange(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className={labelClass}>Model</span>
                    <input
                      type="text"
                      placeholder="Opsiyonel"
                      value={model}
                      onChange={(e) => onModelChange(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-iteo-yellow py-3.5 text-sm font-bold text-iteo-black transition hover:bg-iteo-yellow/90 disabled:opacity-60"
                >
                  {saving ? 'Ekleniyor...' : 'Plaka Ekle'}
                </button>
              </form>
            </SectionCard>
          </div>
        </div>

        <div className="xl:col-span-7">
          <SectionCard
            title="Plaka listesi"
            description={`${vehicles.length} kayıtlı araç`}
            action={
              vehicles.length > 0 ? (
                <span className="rounded-full bg-iteo-gray-100 px-3 py-1 text-xs font-semibold text-iteo-gray-600">
                  {seekingDriverCount > 0 ? `${seekingDriverCount} şoför aranıyor` : 'Tümü dolu'}
                </span>
              ) : undefined
            }
          >
            {vehicles.length === 0 ? (
              <EmptyState
                icon="taxi"
                title="Kayıtlı plaka yok"
                description="Soldan ilk plakanızı ekleyerek başlayın."
              />
            ) : (
              <ul className="space-y-3">
                {vehicles.map((v) => (
                  <li
                    key={v.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-iteo-gray-100 bg-white p-4 shadow-sm transition hover:border-iteo-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-iteo-yellow/20">
                        <IteoIcon name="taxi" size={22} className="text-iteo-black" />
                      </div>
                      <div>
                        <p className="text-lg font-bold tracking-wide text-iteo-black">{v.plateNumber}</p>
                        <p className="text-sm text-iteo-gray-500">
                          {[v.brand, v.model].filter(Boolean).join(' ') || 'Marka / model belirtilmedi'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <StatusBadge
                            label={vehicleStatusLabels[v.status] ?? v.status}
                            tone={vehicleStatusTone(v)}
                          />
                          {!v.activeDriverId && v.status === 'ACTIVE' && (
                            <StatusBadge label="Şoför aranıyor" tone="warning" />
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(v.id)}
                      disabled={actionId === v.id}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-iteo-danger hover:bg-iteo-danger-light disabled:opacity-50"
                    >
                      Sil
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
