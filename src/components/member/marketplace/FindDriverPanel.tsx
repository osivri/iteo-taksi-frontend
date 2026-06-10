'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { parseApiItems } from '@/lib/parse-api-list';
import { ErrorBlock, LoadingBlock, SectionCard } from '@/components/admin/AdminUi';
import { ModulePageHero } from '@/components/member/ModulePageHero';
import { IteoIcon } from '@/components/ui/icons';
import type { AvailableDriver, PlateRequest, Vehicle } from '@/components/member/vehicles/vehicles-shared';
import { labelClass } from '@/components/member/vehicles/vehicles-shared';
import { MarketplaceBrowseShell } from './MarketplaceBrowseShell';
import { MarketplaceFilterBar } from './MarketplaceFilterBar';
import { MarketplaceHistorySection } from './MarketplaceHistorySection';
import { MarketplacePendingBanner } from './MarketplacePendingBanner';
import { formatItemLocationShort } from './marketplace-location';
import { filterDrivers, inputClass } from './marketplace-shared';

export function FindDriverPanel() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<AvailableDriver[]>([]);
  const [requests, setRequests] = useState<PlateRequest[]>([]);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
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

  const filteredDrivers = useMemo(
    () => filterDrivers(drivers, search, district, neighborhood),
    [drivers, search, district, neighborhood],
  );

  const selectedVehicle = driverlessVehicles.find((v) => v.id === selectedVehicleId);

  const resetLocation = () => {
    setDistrict('');
    setNeighborhood('');
  };

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
    <div className="space-y-4 pb-10">
      <ModulePageHero
        badge="Eşleştirme Pazarı"
        title="Şoför Bul"
        description="Plakanızı seçin, ilçe ve mahalleyle filtreleyin, uygun şoföre davet gönderin."
      />

      {error && <ErrorBlock message={error} />}

      <MarketplacePendingBanner
        title="Gelen şoför başvuruları"
        items={pendingApplications.map((r) => ({
          id: r.id,
          title: r.plateNumber,
          subtitle: `${r.driverName ?? 'Şoför'} · Başvuru`,
        }))}
        onApprove={approveRequest}
        onReject={rejectRequest}
        actionId={actionId}
      />

      {driverlessVehicles.length === 0 ? (
        <SectionCard title="Önce plaka ekleyin" description="Şoför daveti için boş bir plaka kaydı gerekir">
          <p className="text-sm text-iteo-gray-600">Tüm plakalarınızda şoför var veya henüz plaka kaydınız yok.</p>
          <Link
            href="/panel/vehicles"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-iteo-yellow px-5 py-3 text-sm font-bold text-iteo-black"
          >
            <IteoIcon name="taxi" size={18} />
            Plakalarım →
          </Link>
        </SectionCard>
      ) : (
        <MarketplaceBrowseShell
          items={drivers}
          district={district}
          neighborhood={neighborhood}
          onDistrictChange={setDistrict}
          onNeighborhoodChange={setNeighborhood}
          onResetLocation={resetLocation}
          entityLabel="şoför"
          filterBar={
            <MarketplaceFilterBar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="İsim, üye no, telefon veya ilçe ara..."
              district={district}
              neighborhood={neighborhood}
              onResetLocation={resetLocation}
              resultCount={filteredDrivers.length}
              resultLabel="şoför"
              stats={[
                { label: 'boş plaka', value: driverlessVehicles.length },
                { label: 'boşta şoför', value: drivers.length },
                {
                  label: 'başvuru',
                  value: pendingApplications.length,
                  highlight: pendingApplications.length > 0,
                },
              ]}
            >
              <label className="block space-y-0.5">
                <span className={labelClass}>Davet plakası</span>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className={inputClass}
                >
                  {driverlessVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber}
                      {[v.brand, v.model].filter(Boolean).length > 0
                        ? ` · ${[v.brand, v.model].filter(Boolean).join(' ')}`
                        : ''}
                    </option>
                  ))}
                </select>
              </label>
            </MarketplaceFilterBar>
          }
          footer={
            selectedVehicle ? (
              <p className="text-xs text-iteo-gray-500">
                Davetler <span className="font-bold text-iteo-black">{selectedVehicle.plateNumber}</span> plakasına
                gönderilir.
              </p>
            ) : null
          }
        >
          {filteredDrivers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-iteo-gray-200 bg-iteo-gray-50 px-4 py-12 text-center text-sm text-iteo-gray-500">
              {drivers.length === 0
                ? 'Şu an boşta şoför bulunmuyor. Daha sonra tekrar kontrol edin.'
                : 'Seçili konum veya arama kriterinize uygun şoför yok.'}
            </p>
          ) : (
            <ul className="divide-y divide-iteo-gray-100 rounded-xl border border-iteo-gray-200">
              {filteredDrivers.map((d) => {
                const location = formatItemLocationShort(d);
                return (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition hover:bg-iteo-gray-50/80"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-iteo-black text-iteo-yellow">
                        <IteoIcon name="user" size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-iteo-black">{d.fullName}</p>
                        <p className="text-xs text-iteo-gray-500">
                          {[d.memberNo ? `Üye No: ${d.memberNo}` : null, d.phone]
                            .filter(Boolean)
                            .join(' · ') || 'İletişim paylaşılmamış'}
                        </p>
                        {location ? (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-iteo-gray-600">
                            <IteoIcon name="pin" size={11} />
                            {location}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => inviteDriver(d.id)}
                      disabled={!selectedVehicleId || actionId === d.id}
                      className="shrink-0 rounded-lg bg-iteo-black px-4 py-2 text-sm font-bold text-iteo-yellow transition hover:bg-iteo-black/90 disabled:opacity-50"
                    >
                      {actionId === d.id ? 'Gönderiliyor...' : 'Davet Gönder'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </MarketplaceBrowseShell>
      )}

      <MarketplaceHistorySection requests={requests} />
    </div>
  );
}
