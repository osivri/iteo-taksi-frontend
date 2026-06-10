'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { parseApiItems } from '@/lib/parse-api-list';
import { ErrorBlock, LoadingBlock, SectionCard, StatCard } from '@/components/admin/AdminUi';
import { ModulePageHero } from '@/components/member/ModulePageHero';
import { StatusBadge } from '@/components/ui/DesignSystem';
import { IteoIcon } from '@/components/ui/icons';
import type { AvailableDriver, PlateRequest, Vehicle } from '@/components/member/vehicles/vehicles-shared';
import { requestStatusLabels, requestStatusTone } from '@/components/member/vehicles/vehicles-shared';
import { MarketplaceSteps } from './MarketplaceSteps';
import { filterDrivers, inputClass, marketplaceSteps } from './marketplace-shared';

export function FindDriverPanel() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<AvailableDriver[]>([]);
  const [requests, setRequests] = useState<PlateRequest[]>([]);
  const [search, setSearch] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [vehiclesRes, driversRes, requestsRes] = await Promise.all([
      api.get<ApiResponse<Vehicle[]>>('/vehicles?limit=100'),
      api.get<ApiResponse<AvailableDriver[]>>('/vehicles/marketplace/available-drivers?limit=100'),
      api.get<ApiResponse<PlateRequest[]>>('/vehicles/plate-requests?limit=100'),
    ]);

    const vehicleList = parseApiItems<Vehicle>(vehiclesRes);
    setVehicles(vehicleList);
    setDrivers(parseApiItems<AvailableDriver>(driversRes));
    setRequests(parseApiItems<PlateRequest>(requestsRes));

    const driverless = vehicleList.filter((v) => v.status === 'ACTIVE' && !v.activeDriverId);
    setSelectedVehicleId((current) => {
      if (current && driverless.some((v) => v.id === current)) return current;
      return driverless[0]?.id ?? '';
    });
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  const driverlessVehicles = useMemo(
    () => vehicles.filter((v) => v.status === 'ACTIVE' && !v.activeDriverId),
    [vehicles],
  );

  const pendingApplications = useMemo(
    () => requests.filter((r) => r.status === 'PENDING' && (r.initiatedBy ?? 'DRIVER') === 'DRIVER'),
    [requests],
  );

  const filteredDrivers = useMemo(() => filterDrivers(drivers, search), [drivers, search]);
  const selectedVehicle = driverlessVehicles.find((v) => v.id === selectedVehicleId);

  async function inviteDriver(driverId: string) {
    if (!selectedVehicleId) {
      setError('Davet göndermek için önce bir plaka seçin.');
      return;
    }

    setActionId(driverId);
    setError(null);
    try {
      await api.post(`/vehicles/${selectedVehicleId}/invite-driver`, { driverId });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionId(null);
    }
  }

  async function approveRequest(id: string) {
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

  async function rejectRequest(id: string) {
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

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6 pb-10">
      <ModulePageHero
        badge="Eşleştirme Pazarı"
        title="Şoför Bul"
        description="Boş plakanız için onaylı şoförleri keşfedin, davet gönderin veya gelen başvuruları değerlendirin."
      />

      {error && <ErrorBlock message={error} />}

      <MarketplaceSteps steps={marketplaceSteps.findDriver} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Boş plaka" value={driverlessVehicles.length} hint="Şoför bekleyen araçlar" />
        <StatCard label="Boşta şoför" value={drivers.length} hint="Aktif ve atanmamış şoförler" />
        <StatCard
          label="Gelen başvuru"
          value={pendingApplications.length}
          hint="Onayınızı bekleyen talepler"
          tone={pendingApplications.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {pendingApplications.length > 0 && (
        <SectionCard
          title="Gelen şoför başvuruları"
          description="Şoförler plakanıza başvurdu — onay veya red verin"
          className="border-iteo-yellow/30 bg-gradient-to-br from-iteo-yellow/10 to-white"
        >
          <ul className="space-y-3">
            {pendingApplications.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-iteo-gray-200 bg-white p-4"
              >
                <div>
                  <p className="font-bold text-iteo-black">{r.plateNumber}</p>
                  <p className="text-sm text-iteo-gray-500">{r.driverName ?? 'Şoför'} · Başvuru</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => approveRequest(r.id)}
                    disabled={actionId === r.id}
                    className="rounded-xl bg-iteo-success px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectRequest(r.id)}
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

      {driverlessVehicles.length === 0 ? (
        <SectionCard title="Önce plaka ekleyin" description="Şoför daveti göndermek için boş bir plaka kaydı gerekir">
          <p className="text-sm text-iteo-gray-600">
            Tüm plakalarınızda şoför var veya henüz plaka kaydınız yok.
          </p>
          <Link
            href="/panel/vehicles"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-iteo-yellow px-5 py-3 text-sm font-bold text-iteo-black"
          >
            <IteoIcon name="taxi" size={18} />
            Plakalarım →
          </Link>
        </SectionCard>
      ) : (
        <>
          <SectionCard title="1. Plaka seçin" description="Davet göndereceğiniz boş plakayı belirleyin">
            <div className="flex flex-wrap gap-2">
              {driverlessVehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    selectedVehicleId === v.id
                      ? 'border-iteo-yellow bg-iteo-yellow text-iteo-black shadow-md'
                      : 'border-iteo-gray-200 bg-white text-iteo-gray-700 hover:border-iteo-yellow/50'
                  }`}
                >
                  <IteoIcon name="taxi" size={16} />
                  {v.plateNumber}
                </button>
              ))}
            </div>
            {selectedVehicle && (
              <p className="mt-3 text-sm text-iteo-gray-500">
                Seçili: <span className="font-semibold text-iteo-black">{selectedVehicle.plateNumber}</span>
                {[selectedVehicle.brand, selectedVehicle.model].filter(Boolean).length > 0 &&
                  ` · ${[selectedVehicle.brand, selectedVehicle.model].filter(Boolean).join(' ')}`}
              </p>
            )}
          </SectionCard>

          <SectionCard
            title="2. Boşta şoförler"
            description={`${filteredDrivers.length} şoför listeleniyor`}
            action={
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="İsim, üye no, telefon..."
                className={`${inputClass} w-48 sm:w-56`}
              />
            }
          >
            {filteredDrivers.length === 0 ? (
              <p className="rounded-xl border border-dashed border-iteo-gray-200 bg-iteo-gray-50 px-4 py-10 text-center text-sm text-iteo-gray-500">
                {drivers.length === 0
                  ? 'Şu an boşta şoför bulunmuyor. Daha sonra tekrar kontrol edin.'
                  : 'Arama kriterinize uygun şoför yok.'}
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {filteredDrivers.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-iteo-gray-200 bg-white p-4 shadow-sm transition hover:border-iteo-yellow/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-iteo-black text-iteo-yellow">
                        <IteoIcon name="user" size={22} />
                      </div>
                      <div>
                        <p className="font-bold text-iteo-black">{d.fullName}</p>
                        <p className="mt-1 text-sm text-iteo-gray-500">
                          {[d.memberNo ? `Üye No: ${d.memberNo}` : null, d.phone].filter(Boolean).join(' · ') ||
                            'İletişim bilgisi paylaşılmamış'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => inviteDriver(d.id)}
                      disabled={!selectedVehicleId || actionId === d.id}
                      className="w-full rounded-xl bg-iteo-black py-2.5 text-sm font-bold text-iteo-yellow transition hover:bg-iteo-black/90 disabled:opacity-50"
                    >
                      {actionId === d.id ? 'Gönderiliyor...' : 'Davet Gönder'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      )}

      {requests.length > 0 && (
        <SectionCard title="Eşleştirme geçmişi" description="Davet ve başvuru kayıtları">
          <ul className="divide-y divide-iteo-gray-100">
            {requests.slice(0, 10).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-semibold text-iteo-black">{r.plateNumber}</p>
                  <p className="text-xs text-iteo-gray-500">
                    {(r.initiatedBy ?? 'DRIVER') === 'OWNER' ? 'Davet' : 'Başvuru'} ·{' '}
                    {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <StatusBadge label={requestStatusLabels[r.status] ?? r.status} tone={requestStatusTone(r.status)} />
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
