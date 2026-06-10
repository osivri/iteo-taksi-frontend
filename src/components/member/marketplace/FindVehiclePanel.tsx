'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, ApiResponse } from '@/lib/api/client';
import { parseApiItems } from '@/lib/parse-api-list';
import { ErrorBlock, LoadingBlock } from '@/components/admin/AdminUi';
import { ModulePageHero } from '@/components/member/ModulePageHero';
import { StatusBadge } from '@/components/ui/DesignSystem';
import { IteoIcon } from '@/components/ui/icons';
import type { AvailableVehicle, PlateRequest, Vehicle } from '@/components/member/vehicles/vehicles-shared';
import { labelClass, requestStatusLabels, requestStatusTone, inputClass as vehicleInputClass } from '@/components/member/vehicles/vehicles-shared';
import { MarketplaceBrowseShell } from './MarketplaceBrowseShell';
import { MarketplaceFilterBar } from './MarketplaceFilterBar';
import { MarketplacePendingBanner } from './MarketplacePendingBanner';
import { formatItemLocationShort } from './marketplace-location';
import { filterVehicles, inputClass } from './marketplace-shared';

export function FindVehiclePanel() {
  const [available, setAvailable] = useState<AvailableVehicle[]>([]);
  const [myVehicles, setMyVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<PlateRequest[]>([]);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
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

  const filtered = useMemo(
    () => filterVehicles(available, search, district, neighborhood),
    [available, search, district, neighborhood],
  );

  const resetLocation = () => {
    setDistrict('');
    setNeighborhood('');
  };

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
    <div className="space-y-4 pb-10">
      <ModulePageHero
        badge="Eşleştirme Pazarı"
        title="Araç Bul"
        description="İlçe ve mahalle seçerek boş araçları listeleyin, başvurun veya davetleri yönetin."
      />

      {error && <ErrorBlock message={error} />}

      <MarketplacePendingBanner
        title="Gelen plaka davetleri"
        items={pendingInvites.map((r) => ({
          id: r.id,
          title: r.plateNumber,
          subtitle: `${r.ownerName ?? 'Oda üyesi'} · Davet`,
        }))}
        onApprove={approveInvite}
        onReject={rejectInvite}
        actionId={actionId}
        approveLabel="Kabul Et"
      />

      <MarketplaceBrowseShell
        items={available}
        district={district}
        neighborhood={neighborhood}
        onDistrictChange={setDistrict}
        onNeighborhoodChange={setNeighborhood}
        onResetLocation={resetLocation}
        entityLabel="araç"
        filterBar={
          <MarketplaceFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Plaka, marka, oda üyesi veya ilçe ara..."
            district={district}
            neighborhood={neighborhood}
            onResetLocation={resetLocation}
            resultCount={filtered.length}
            resultLabel="araç"
            stats={[
              { label: 'boş araç', value: available.length },
              {
                label: 'davet',
                value: pendingInvites.length,
                highlight: pendingInvites.length > 0,
              },
              { label: 'onaylı plaka', value: myVehicles.length },
            ]}
          />
        }
      >
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-iteo-gray-200 bg-iteo-gray-50 px-4 py-12 text-center text-sm text-iteo-gray-500">
            {available.length === 0
              ? 'Şu an başvurulabileceğiniz boş araç yok. Listeyi daha sonra tekrar kontrol edin.'
              : 'Seçili konum veya arama kriterinize uygun araç bulunamadı.'}
          </p>
        ) : (
          <ul className="divide-y divide-iteo-gray-100 rounded-xl border border-iteo-gray-200">
            {filtered.map((v) => {
              const location = formatItemLocationShort(v);
              return (
                <li
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition hover:bg-iteo-gray-50/80"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-iteo-yellow/25">
                      <IteoIcon name="taxi" size={18} className="text-iteo-black" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-black tracking-wide text-iteo-black">{v.plateNumber}</p>
                      <p className="text-xs text-iteo-gray-500">
                        {[v.brand, v.model].filter(Boolean).join(' ') || 'Araç bilgisi yok'} · {v.ownerName}
                      </p>
                      {location ? (
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-iteo-gray-600">
                          <IteoIcon name="pin" size={11} />
                          {location}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {v.hasPendingRequest ? (
                    <StatusBadge label="Başvuruldu" tone="warning" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => applyToVehicle(v.id)}
                      disabled={actionId === v.id}
                      className="shrink-0 rounded-lg bg-iteo-yellow px-4 py-2 text-sm font-bold text-iteo-black disabled:opacity-60"
                    >
                      {actionId === v.id ? 'Gönderiliyor...' : 'Başvur'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </MarketplaceBrowseShell>

      <div className="grid gap-4 lg:grid-cols-2">
        <details className="rounded-2xl border border-iteo-gray-200 bg-white shadow-sm">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-iteo-black marker:content-none sm:px-5">
            Plaka numarasıyla başvuru (opsiyonel)
          </summary>
          <form onSubmit={handlePlateSubmit} className="space-y-4 border-t border-iteo-gray-100 px-4 py-4 sm:px-5">
            <label className="block space-y-1.5">
              <span className={labelClass}>Plaka</span>
              <input
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="34 ABC 123"
                required
                className={`${vehicleInputClass} font-semibold uppercase tracking-wide`}
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
        </details>

        <details className="rounded-2xl border border-iteo-gray-200 bg-white shadow-sm">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-iteo-black marker:content-none sm:px-5">
            Taleplerim ({requests.length})
          </summary>
          <div className="border-t border-iteo-gray-100 px-4 py-4 sm:px-5">
            {requests.length === 0 ? (
              <p className="text-sm text-iteo-gray-500">Henüz eşleştirme talebiniz yok.</p>
            ) : (
              <ul className="max-h-56 space-y-2 overflow-y-auto">
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
            <Link
              href="/panel/vehicles"
              className="mt-4 inline-block text-sm font-semibold text-iteo-yellow hover:underline"
            >
              Çalışma plakalarım →
            </Link>
          </div>
        </details>
      </div>
    </div>
  );
}
