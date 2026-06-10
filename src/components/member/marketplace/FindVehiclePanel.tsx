'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, ApiResponse } from '@/lib/api/client';
import { parseApiItems } from '@/lib/parse-api-list';
import { ErrorBlock, LoadingBlock, SectionCard, StatCard } from '@/components/admin/AdminUi';
import { ModulePageHero } from '@/components/member/ModulePageHero';
import { StatusBadge } from '@/components/ui/DesignSystem';
import { IteoIcon } from '@/components/ui/icons';
import type { AvailableVehicle, PlateRequest, Vehicle } from '@/components/member/vehicles/vehicles-shared';
import { labelClass, requestStatusLabels, requestStatusTone, inputClass as vehicleInputClass } from '@/components/member/vehicles/vehicles-shared';
import { MarketplaceSteps } from './MarketplaceSteps';
import { filterVehicles, inputClass, marketplaceSteps } from './marketplace-shared';

export function FindVehiclePanel() {
  const [available, setAvailable] = useState<AvailableVehicle[]>([]);
  const [myVehicles, setMyVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<PlateRequest[]>([]);
  const [search, setSearch] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [availRes, vehiclesRes, requestsRes] = await Promise.all([
      api.get<ApiResponse<AvailableVehicle[]>>('/vehicles/marketplace/available-vehicles?limit=100'),
      api.get<ApiResponse<Vehicle[]>>('/vehicles?limit=100'),
      api.get<ApiResponse<PlateRequest[]>>('/vehicles/plate-requests?limit=100'),
    ]);

    setAvailable(parseApiItems<AvailableVehicle>(availRes));
    setMyVehicles(parseApiItems<Vehicle>(vehiclesRes));
    setRequests(parseApiItems<PlateRequest>(requestsRes));
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  const pendingInvites = useMemo(
    () => requests.filter((r) => r.status === 'PENDING' && r.initiatedBy === 'OWNER'),
    [requests],
  );

  const filtered = useMemo(() => filterVehicles(available, search), [available, search]);

  async function applyToVehicle(vehicleId: string) {
    setActionId(vehicleId);
    setError(null);
    try {
      await api.post('/vehicles/plate-requests/by-vehicle', { vehicleId });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionId(null);
    }
  }

  async function approveInvite(id: string) {
    setActionId(id);
    setError(null);
    try {
      await api.patch(`/vehicles/plate-requests/${id}/approve`, {});
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionId(null);
    }
  }

  async function rejectInvite(id: string) {
    setActionId(id);
    setError(null);
    try {
      await api.patch(`/vehicles/plate-requests/${id}/reject`, {});
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionId(null);
    }
  }

  async function handlePlateSubmit(e: FormEvent) {
    e.preventDefault();
    if (!plateNumber.trim()) {
      setError('Plaka alanı zorunludur.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.post('/vehicles/plate-requests', {
        plateNumber: plateNumber.trim().toUpperCase(),
      });
      setPlateNumber('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6 pb-10">
      <ModulePageHero
        badge="Eşleştirme Pazarı"
        title="Araç Bul"
        description="Şoför arayan kayıtlı plakaları keşfedin, başvurun veya oda üyesi davetlerini yönetin."
      />

      {error && <ErrorBlock message={error} />}

      <MarketplaceSteps steps={marketplaceSteps.findVehicle} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Boşta araç" value={available.length} hint="Başvurulabilir plakalar" />
        <StatCard
          label="Gelen davet"
          value={pendingInvites.length}
          hint="Oda üyesi davetleri"
          tone={pendingInvites.length > 0 ? 'warning' : 'default'}
        />
        <StatCard label="Onaylı plaka" value={myVehicles.length} hint="Çalışma yetkiniz olan plakalar" tone="success" />
      </div>

      {pendingInvites.length > 0 && (
        <SectionCard
          title="Gelen plaka davetleri"
          description="Kabul ettiğinizde bu plakada çalışmaya başlarsınız"
          className="border-iteo-yellow/30 bg-gradient-to-br from-iteo-yellow/10 to-white"
        >
          <ul className="space-y-3">
            {pendingInvites.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-iteo-gray-200 bg-white p-4"
              >
                <div>
                  <p className="font-bold text-iteo-black">{r.plateNumber}</p>
                  <p className="text-sm text-iteo-gray-500">{r.ownerName ?? 'Oda üyesi'} · Davet</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => approveInvite(r.id)}
                    disabled={actionId === r.id}
                    className="rounded-xl bg-iteo-success px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Kabul Et
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectInvite(r.id)}
                    disabled={actionId === r.id}
                    className="rounded-xl border border-iteo-danger/30 px-4 py-2 text-sm font-semibold text-iteo-danger disabled:opacity-60"
                  >
                    Reddet
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard
        title="Kayıtlı boş araçlar"
        description="Sistemde kayıtlı ve şoför bekleyen plakalar"
        action={
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Plaka, marka, oda üyesi..."
            className={`${inputClass} w-48 sm:w-64`}
          />
        }
      >
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-iteo-gray-200 bg-iteo-gray-50 px-4 py-10 text-center text-sm text-iteo-gray-500">
            {available.length === 0
              ? 'Şu an başvurabileceğiniz boş araç yok. Listeyi daha sonra tekrar kontrol edin.'
              : 'Arama kriterinize uygun araç bulunamadı.'}
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => (
              <li
                key={v.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-iteo-gray-200 bg-white p-4 shadow-sm transition hover:border-iteo-yellow/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-iteo-yellow/20">
                      <IteoIcon name="taxi" size={20} className="text-iteo-black" />
                    </div>
                    <p className="text-lg font-black tracking-wide text-iteo-black">{v.plateNumber}</p>
                  </div>
                  <p className="mt-3 text-sm text-iteo-gray-600">
                    {[v.brand, v.model].filter(Boolean).join(' ') || 'Araç bilgisi belirtilmemiş'}
                  </p>
                  <p className="mt-1 text-xs text-iteo-gray-500">Oda üyesi: {v.ownerName}</p>
                </div>
                {v.hasPendingRequest ? (
                  <StatusBadge label="Başvuruldu" tone="warning" />
                ) : (
                  <button
                    type="button"
                    onClick={() => applyToVehicle(v.id)}
                    disabled={actionId === v.id}
                    className="w-full rounded-xl bg-iteo-yellow py-2.5 text-sm font-bold text-iteo-black disabled:opacity-60"
                  >
                    {actionId === v.id ? 'Gönderiliyor...' : 'Başvur'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Plaka numarasıyla başvuru"
          description="Listede yoksa kayıtlı plakaya doğrudan talep gönderin (opsiyonel)"
        >
          <form onSubmit={handlePlateSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className={labelClass}>Plaka</span>
              <input
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="34 ABC 123"
                required
                className={`${vehicleInputClass} uppercase font-semibold tracking-wide`}
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl border border-iteo-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-iteo-black hover:border-iteo-yellow disabled:opacity-60"
            >
              {saving ? 'Gönderiliyor...' : 'Onay Talebi Gönder'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Taleplerim" description="Başvuru ve davet geçmişiniz">
          {requests.length === 0 ? (
            <p className="text-sm text-iteo-gray-500">Henüz eşleştirme talebiniz yok.</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-iteo-gray-100 px-3 py-2"
                >
                  <div>
                    <p className="font-semibold text-iteo-black">{r.plateNumber}</p>
                    <p className="text-xs text-iteo-gray-500">
                      {(r.initiatedBy ?? 'DRIVER') === 'OWNER' ? 'Davet' : 'Başvuru'}
                    </p>
                  </div>
                  <StatusBadge label={requestStatusLabels[r.status] ?? r.status} tone={requestStatusTone(r.status)} />
                </li>
              ))}
            </ul>
          )}
          <Link href="/panel/vehicles" className="mt-4 inline-block text-sm font-semibold text-iteo-yellow hover:underline">
            Çalışma plakalarım →
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
