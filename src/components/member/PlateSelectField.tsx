'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { activeMemberVehicles, parseMemberVehiclesResponse, type MemberVehicle } from '@/lib/member-vehicles';
import { IteoIcon } from '@/components/ui/icons';
import { inputClass, labelClass } from '@/components/member/vehicles/vehicles-shared';

interface Props {
  value: string;
  onChange: (vehicleId: string, vehicle: MemberVehicle | null) => void;
  required?: boolean;
  label?: string;
  vehicles?: MemberVehicle[];
  vehiclesLink?: string;
  vehiclesLinkLabel?: string;
  hint?: string;
}

export function PlateSelectField({
  value,
  onChange,
  required = false,
  label = 'Plaka',
  vehicles: externalVehicles,
  vehiclesLink = '/panel/vehicles',
  vehiclesLinkLabel = 'Plakalarım',
  hint,
}: Props) {
  const [vehicles, setVehicles] = useState<MemberVehicle[]>(externalVehicles ?? []);
  const [loading, setLoading] = useState(externalVehicles === undefined);

  useEffect(() => {
    if (externalVehicles !== undefined) {
      setVehicles(externalVehicles);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api
      .get<ApiResponse<MemberVehicle[]>>('/vehicles?limit=100')
      .then((res) => {
        if (cancelled) return;
        setVehicles(activeMemberVehicles(parseMemberVehiclesResponse(res)));
      })
      .catch(() => {
        if (!cancelled) setVehicles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [externalVehicles]);

  useEffect(() => {
    if (!value && vehicles.length > 0) {
      onChange(vehicles[0].id, vehicles[0]);
    }
  }, [vehicles, value, onChange]);

  if (loading) {
    return (
      <div className="text-sm text-iteo-gray-500" aria-live="polite">
        Plakalar yükleniyor...
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-iteo-gray-50 px-4 py-5">
        <p className="text-sm font-semibold text-iteo-black">Kayıtlı plakanız bulunmuyor</p>
        <p className="mt-1 text-xs text-iteo-gray-500">
          Bu alan yalnızca sistemde kayıtlı plakalardan seçim yapar. Önce plakanızı ekleyin veya onay bekleyin.
        </p>
        <Link
          href={vehiclesLink}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-iteo-yellow hover:underline"
        >
          {vehiclesLinkLabel} →
        </Link>
      </div>
    );
  }

  return (
    <label className="block space-y-1.5">
      <span className={labelClass}>
        {label}
        {required ? ' *' : ''}
      </span>
      <select
        value={value}
        onChange={(e) => {
          const vehicle = vehicles.find((v) => v.id === e.target.value) ?? null;
          onChange(e.target.value, vehicle);
        }}
        required={required}
        className={inputClass}
      >
        {!required && <option value="">Seçiniz</option>}
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.plateNumber}
            {v.brand || v.model ? ` — ${[v.brand, v.model].filter(Boolean).join(' ')}` : ''}
          </option>
        ))}
      </select>
      <p className="flex items-center gap-1.5 text-xs text-iteo-gray-500">
        <IteoIcon name="taxi" size={14} />
        {hint ?? (
          <>
            Yeni plaka için{' '}
            <Link href={vehiclesLink} className="font-semibold text-iteo-yellow hover:underline">
              {vehiclesLinkLabel}
            </Link>
          </>
        )}
      </p>
    </label>
  );
}
