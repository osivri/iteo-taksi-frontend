'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { fetchCurrentProfile } from '@/lib/member-profile';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';
import type { MemberProfile, MemberRole } from '@/lib/member';

interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  status: string;
  activeDriverId?: string | null;
}

interface PlateRequest {
  id: string;
  plateNumber: string;
  status: string;
  initiatedBy?: string;
  driverName?: string;
  ownerName?: string;
  createdAt: string;
}

interface AvailableVehicle {
  id: string;
  plateNumber: string;
  brand: string | null;
  model: string | null;
  ownerName: string;
  hasPendingRequest: boolean;
}

interface AvailableDriver {
  id: string;
  fullName: string;
  memberNo: string | null;
  phone: string | null;
}

const requestStatusLabels: Record<string, string> = {
  PENDING: 'Onay bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  CANCELLED: 'İptal',
};

const vehicleStatusLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  PASSIVE: 'Pasif',
};

export default function PanelVehiclesPage() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<PlateRequest[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedVehicleForInvite, setSelectedVehicleForInvite] = useState<string | null>(null);

  const [plateNumber, setPlateNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  const role = profile?.role as MemberRole | undefined;
  const isDriver = role === 'DRIVER';
  const isOwner = role === 'PLATE_OWNER';

  const load = useCallback(async () => {
    const p = await fetchCurrentProfile();
    setProfile(p);

    const [vehiclesRes, requestsRes] = await Promise.all([
      api.get<ApiResponse<Vehicle[]>>('/vehicles'),
      api.get<ApiResponse<PlateRequest[]>>('/vehicles/plate-requests'),
    ]);

    setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
    setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);

    if (p.role === 'DRIVER') {
      const availRes = await api.get<ApiResponse<AvailableVehicle[]>>('/vehicles/marketplace/available-vehicles');
      setAvailableVehicles(Array.isArray(availRes.data) ? availRes.data : []);
      setAvailableDrivers([]);
    } else if (p.role === 'PLATE_OWNER') {
      const driversRes = await api.get<ApiResponse<AvailableDriver[]>>('/vehicles/marketplace/available-drivers');
      setAvailableDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);
      setAvailableVehicles([]);
    }
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  async function handleDriverSubmit(e: FormEvent) {
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

  async function inviteDriver(driverId: string) {
    const driverless = vehicles.filter((v) => v.status === 'ACTIVE' && !v.activeDriverId);
    let vehicleId = selectedVehicleForInvite;
    if (!vehicleId && driverless.length === 1) vehicleId = driverless[0].id;
    if (!vehicleId) {
      setError('Lütfen davet için bir plaka seçin.');
      return;
    }

    setActionId(driverId);
    setError(null);
    try {
      await api.post(`/vehicles/${vehicleId}/invite-driver`, { driverId });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionId(null);
    }
  }

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

  const pendingOwnerRequests = requests.filter((r) => r.status === 'PENDING' && (r.initiatedBy ?? 'DRIVER') === 'DRIVER');
  const pendingDriverInvites = requests.filter((r) => r.status === 'PENDING' && r.initiatedBy === 'OWNER');
  const driverlessOwnerVehicles = vehicles.filter((v) => v.status === 'ACTIVE' && !v.activeDriverId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isDriver ? 'Çalışma Bilgileri' : 'Plakalarım'}
        description={
          isDriver
            ? 'Boş araçlara başvurun veya plaka numarasıyla talep oluşturun.'
            : 'Boşta şoför bulun veya gelen başvuruları değerlendirin.'
        }
      />

      {error && <ErrorBlock message={error} />}

      {isDriver && (
        <>
          {pendingDriverInvites.length > 0 && (
            <div className="rounded-xl border border-iteo-yellow/40 bg-iteo-yellow-light p-5 space-y-3">
              <h2 className="font-semibold text-iteo-black">Gelen plaka davetleri</h2>
              {pendingDriverInvites.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-iteo-gray-200 bg-white p-4">
                  <div>
                    <p className="font-semibold text-iteo-black">{r.plateNumber}</p>
                    <p className="text-xs text-iteo-gray-500">{r.ownerName ?? 'Mal sahibi'} · Davet</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => approveRequest(r.id)} disabled={actionId === r.id} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60">Kabul</button>
                    <button type="button" onClick={() => rejectRequest(r.id)} disabled={actionId === r.id} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-60">Reddet</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-iteo-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-iteo-black">Boşta araçlar</h2>
            <p className="text-sm text-iteo-gray-500">Şoför arayan kayıtlı plakalar. Başvurunuz mal sahibine iletilir.</p>
            {availableVehicles.length === 0 ? (
              <p className="text-sm text-iteo-gray-500">Şu an boşta araç bulunmuyor.</p>
            ) : (
              <div className="space-y-3">
                {availableVehicles.map((v) => (
                  <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-iteo-gray-200 p-4">
                    <div>
                      <p className="font-semibold text-iteo-black">{v.plateNumber}</p>
                      <p className="text-xs text-iteo-gray-500">
                        {[v.brand, v.model].filter(Boolean).join(' ') || 'Araç bilgisi yok'} · {v.ownerName}
                      </p>
                    </div>
                    {v.hasPendingRequest ? (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Başvuruldu</span>
                    ) : (
                      <button type="button" onClick={() => applyToVehicle(v.id)} disabled={actionId === v.id} className="rounded-lg bg-iteo-yellow px-4 py-2 text-sm font-semibold text-iteo-black disabled:opacity-60">
                        Başvur
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleDriverSubmit} className="rounded-xl border border-iteo-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-iteo-black">Plaka numarasıyla başvur</h2>
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Plaka (34 ABC 123)" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value.toUpperCase())} required className="min-w-[200px] flex-1 rounded-lg border border-iteo-gray-200 px-4 py-2.5 uppercase" />
              <button type="submit" disabled={saving} className="rounded-lg bg-iteo-yellow px-5 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-60">
                {saving ? 'Gönderiliyor...' : 'Onay Talebi Gönder'}
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-iteo-black">Taleplerim</h2>
            {requests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">Henüz plaka talebiniz yok.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-iteo-gray-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-iteo-gray-200 bg-iteo-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Plaka</th>
                      <th className="px-4 py-3 text-left font-semibold">Tür</th>
                      <th className="px-4 py-3 text-left font-semibold">Durum</th>
                      <th className="px-4 py-3 text-left font-semibold">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-b border-iteo-gray-100 last:border-0">
                        <td className="px-4 py-3 font-semibold">{r.plateNumber}</td>
                        <td className="px-4 py-3">{(r.initiatedBy ?? 'DRIVER') === 'OWNER' ? 'Davet' : 'Başvuru'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'APPROVED' ? 'bg-green-100 text-green-800' : r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {requestStatusLabels[r.status] ?? r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-iteo-gray-600">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {vehicles.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-iteo-black">Onaylı çalışma plakalarım</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {vehicles.map((v) => (
                  <div key={v.id} className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="font-bold text-iteo-black">{v.plateNumber}</p>
                    <p className="mt-1 text-sm text-green-800">Onaylı · {vehicleStatusLabels[v.status] ?? v.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {isOwner && (
        <>
          {pendingOwnerRequests.length > 0 && (
            <div className="rounded-xl border border-iteo-yellow/40 bg-iteo-yellow-light p-5 space-y-3">
              <h2 className="font-semibold text-iteo-black">Gelen şoför başvuruları</h2>
              {pendingOwnerRequests.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-iteo-gray-200 bg-white p-4">
                  <div>
                    <p className="font-semibold text-iteo-black">{r.plateNumber}</p>
                    <p className="text-xs text-iteo-gray-500">{r.driverName ?? 'Şoför'} · Başvuru</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => approveRequest(r.id)} disabled={actionId === r.id} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60">Onayla</button>
                    <button type="button" onClick={() => rejectRequest(r.id)} disabled={actionId === r.id} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-60">Reddet</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {driverlessOwnerVehicles.length > 0 && availableDrivers.length > 0 && (
            <div className="rounded-xl border border-iteo-gray-200 bg-white p-6 space-y-4">
              <h2 className="font-semibold text-iteo-black">Boşta şoförler</h2>
              <p className="text-sm text-iteo-gray-500">Şoför arayan plakanız için uygun adayları davet edin.</p>

              {driverlessOwnerVehicles.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {driverlessOwnerVehicles.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVehicleForInvite(v.id)}
                      className={`rounded-full border px-3 py-1 text-sm font-semibold ${selectedVehicleForInvite === v.id ? 'border-iteo-yellow bg-iteo-yellow-light' : 'border-iteo-gray-200'}`}>
                      {v.plateNumber}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {availableDrivers.map((d) => (
                  <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-iteo-gray-200 p-4">
                    <div>
                      <p className="font-semibold text-iteo-black">{d.fullName}</p>
                      <p className="text-xs text-iteo-gray-500">
                        {[d.memberNo ? `Üye No: ${d.memberNo}` : null, d.phone].filter(Boolean).join(' · ') || 'İletişim bilgisi yok'}
                      </p>
                    </div>
                    <button type="button" onClick={() => inviteDriver(d.id)} disabled={actionId === d.id} className="rounded-lg bg-iteo-yellow px-4 py-2 text-sm font-semibold text-iteo-black disabled:opacity-60">
                      Davet Et
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleOwnerSubmit} className="rounded-xl border border-iteo-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-iteo-black">Yeni plaka ekle</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <input type="text" placeholder="Plaka * (34 ABC 123)" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value.toUpperCase())} required className="rounded-lg border border-iteo-gray-200 px-4 py-2.5 uppercase" />
              <input type="text" placeholder="Marka (opsiyonel)" value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-lg border border-iteo-gray-200 px-4 py-2.5" />
              <input type="text" placeholder="Model (opsiyonel)" value={model} onChange={(e) => setModel(e.target.value)} className="rounded-lg border border-iteo-gray-200 px-4 py-2.5" />
            </div>
            <button type="submit" disabled={saving} className="rounded-lg bg-iteo-yellow px-5 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-60">
              {saving ? 'Ekleniyor...' : 'Plaka Ekle'}
            </button>
          </form>

          {vehicles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">Kayıtlı plaka yok. Yukarıdan ilk plakanızı ekleyin.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-iteo-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="border-b border-iteo-gray-200 bg-iteo-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Plaka</th>
                    <th className="px-4 py-3 text-left font-semibold">Marka / Model</th>
                    <th className="px-4 py-3 text-left font-semibold">Durum</th>
                    <th className="px-4 py-3 text-left font-semibold">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} className="border-b border-iteo-gray-100 last:border-0">
                      <td className="px-4 py-3 font-semibold">{v.plateNumber}</td>
                      <td className="px-4 py-3 text-iteo-gray-700">{[v.brand, v.model].filter(Boolean).join(' ') || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <span>{vehicleStatusLabels[v.status] ?? v.status}</span>
                          {!v.activeDriverId && v.status === 'ACTIVE' && (
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Şoför aranıyor</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => removeVehicle(v.id)} disabled={actionId === v.id} className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50">Sil</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
