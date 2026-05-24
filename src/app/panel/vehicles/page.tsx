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
}

interface PlateRequest {
  id: string;
  plateNumber: string;
  status: string;
  createdAt: string;
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

    const [vehiclesRes, requestsRes] = await Promise.all([
      api.get<ApiResponse<Vehicle[]>>('/vehicles'),
      api.get<ApiResponse<PlateRequest[]>>('/vehicles/plate-requests'),
    ]);

    setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
    setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
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

  const pendingOwnerRequests = requests.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      <PageHeader
        title={isDriver ? 'Çalışma Bilgileri' : 'Plakalarım'}
        description={
          isDriver
            ? 'Çalıştığınız plakayı girin; plaka sahibine onay talebi gider.'
            : 'Plakalarınızı yönetin ve şoför onay taleplerini değerlendirin.'
        }
      />

      {error && <ErrorBlock message={error} />}

      {isDriver && (
        <>
          <form
            onSubmit={handleDriverSubmit}
            className="rounded-xl border border-iteo-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-iteo-black">Plaka ile çalışma talebi</h2>
            <p className="text-sm text-iteo-gray-500">
              Plakayı girdikten sonra ilgili plaka sahibine onay bildirimi düşer.
            </p>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Plaka (34 ABC 123)"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                required
                className="min-w-[200px] flex-1 rounded-lg border border-iteo-gray-200 px-4 py-2.5 uppercase"
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-iteo-yellow px-5 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-60">
                {saving ? 'Gönderiliyor...' : 'Onay Talebi Gönder'}
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-iteo-black">Taleplerim</h2>
            {requests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
                Henüz plaka talebiniz yok.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-iteo-gray-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-iteo-gray-200 bg-iteo-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Plaka</th>
                      <th className="px-4 py-3 text-left font-semibold">Durum</th>
                      <th className="px-4 py-3 text-left font-semibold">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-b border-iteo-gray-100 last:border-0">
                        <td className="px-4 py-3 font-semibold">{r.plateNumber}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              r.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : r.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                            {requestStatusLabels[r.status] ?? r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-iteo-gray-600">
                          {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                        </td>
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
              <h2 className="font-semibold text-iteo-black">Bekleyen şoför onayları</h2>
              {pendingOwnerRequests.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-iteo-gray-200 bg-white p-4">
                  <div>
                    <p className="font-semibold text-iteo-black">{r.plateNumber}</p>
                    <p className="text-xs text-iteo-gray-500">
                      {new Date(r.createdAt).toLocaleDateString('tr-TR')} · Şoför çalışma talebi
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => approveRequest(r.id)}
                      disabled={actionId === r.id}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60">
                      Onayla
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectRequest(r.id)}
                      disabled={actionId === r.id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-60">
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleOwnerSubmit}
            className="rounded-xl border border-iteo-gray-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-iteo-black">Yeni plaka ekle</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                type="text"
                placeholder="Plaka * (34 ABC 123)"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                required
                className="rounded-lg border border-iteo-gray-200 px-4 py-2.5 uppercase"
              />
              <input
                type="text"
                placeholder="Marka (opsiyonel)"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="rounded-lg border border-iteo-gray-200 px-4 py-2.5"
              />
              <input
                type="text"
                placeholder="Model (opsiyonel)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="rounded-lg border border-iteo-gray-200 px-4 py-2.5"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-iteo-yellow px-5 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-60">
              {saving ? 'Ekleniyor...' : 'Plaka Ekle'}
            </button>
          </form>

          {vehicles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
              Kayıtlı plaka yok. Yukarıdan ilk plakanızı ekleyin.
            </div>
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
                      <td className="px-4 py-3 text-iteo-gray-700">
                        {[v.brand, v.model].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="px-4 py-3">{vehicleStatusLabels[v.status] ?? v.status}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeVehicle(v.id)}
                          disabled={actionId === v.id}
                          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50">
                          Sil
                        </button>
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
