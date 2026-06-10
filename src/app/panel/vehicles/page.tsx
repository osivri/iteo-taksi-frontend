'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { fetchCurrentProfile } from '@/lib/member-profile';
import { parseApiItems } from '@/lib/parse-api-list';
import { ErrorBlock, LoadingBlock } from '@/components/admin/AdminUi';
import { DriverVehiclesView } from '@/components/member/vehicles/DriverVehiclesView';
import { OwnerVehiclesView } from '@/components/member/vehicles/OwnerVehiclesView';
import type { Vehicle } from '@/components/member/vehicles/vehicles-shared';
import { ModulePageHero } from '@/components/member/ModulePageHero';
import type { MemberProfile, MemberRole } from '@/lib/member';

export default function PanelVehiclesPage() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [plateNumber, setPlateNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  const role = profile?.role as MemberRole | undefined;
  const isDriver = role === 'DRIVER';
  const isOwner = role === 'PLATE_OWNER';

  const load = useCallback(async () => {
    const p = await fetchCurrentProfile();
    setProfile(p);

    const vehiclesRes = await api.get<ApiResponse<Vehicle[]>>('/vehicles?limit=100');
    setVehicles(parseApiItems<Vehicle>(vehiclesRes));
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  async function handleOwnerSubmit(e: FormEvent) {
    e.preventDefault();
    if (!plateNumber.trim()) {
      setError('Plaka alanı zorunludur.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.post('/vehicles', {
        plateNumber: plateNumber.trim().toUpperCase(),
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
      });
      setPlateNumber('');
      setBrand('');
      setModel('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function removeVehicle(id: string) {
    if (!confirm('Bu plakayı silmek istediğinize emin misiniz?')) return;
    setActionId(id);
    setError(null);
    try {
      await api.delete(`/vehicles/${id}`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionId(null);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6 pb-10">
      <ModulePageHero
        badge={isDriver ? 'Şoför' : 'Oda Üyesi'}
        title={isDriver ? 'Çalışma Bilgileri' : 'Plakalarım'}
        description={
          isDriver
            ? 'Onaylı çalışma plakalarınızı görün. Yeni araç aramak için Araç Bul modülünü kullanın.'
            : 'Plakalarınızı kaydedin ve yönetin. Şoför eşleştirmesi için Şoför Bul modülüne gidin.'
        }
        decoration={
          <svg
            className="pointer-events-none absolute bottom-4 right-8 h-24 w-40 text-iteo-yellow/10"
            viewBox="0 0 200 120"
            fill="currentColor"
            aria-hidden
          >
            <path d="M20 80 H180 L165 40 H35 Z" />
            <circle cx="55" cy="88" r="14" />
            <circle cx="145" cy="88" r="14" />
            <rect x="78" y="48" width="44" height="16" rx="4" />
          </svg>
        }
      />

      {error && <ErrorBlock message={error} />}

      {isDriver && <DriverVehiclesView vehicles={vehicles} />}

      {isOwner && (
        <OwnerVehiclesView
          vehicles={vehicles}
          plateNumber={plateNumber}
          brand={brand}
          model={model}
          saving={saving}
          actionId={actionId}
          onPlateNumberChange={setPlateNumber}
          onBrandChange={setBrand}
          onModelChange={setModel}
          onSubmit={handleOwnerSubmit}
          onRemove={removeVehicle}
        />
      )}
    </div>
  );
}
