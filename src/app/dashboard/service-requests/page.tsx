'use client';

import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface ServiceRequestRow {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  plateNumber: string | null;
  locationAddress: string | null;
  adminNote: string | null;
  createdAt: string;
}

const types = ['TOW', 'INSURANCE', 'COMPLAINT', 'PIRATE_REPORT', 'PETITION', 'ACTIVITY_CERTIFICATE'] as const;

const typeLabels: Record<string, string> = {
  TOW: 'Çekici',
  INSURANCE: 'Sigorta',
  COMPLAINT: 'Şikayet',
  PIRATE_REPORT: 'Korsan İhbar',
  PETITION: 'Dilekçe',
  ACTIVITY_CERTIFICATE: 'Faaliyet Belgesi',
};

const statuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'] as const;

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  ASSIGNED: 'Atandı',
  IN_PROGRESS: 'İşlemde',
  COMPLETED: 'Tamamlandı',
  REJECTED: 'Reddedildi',
  CANCELLED: 'İptal',
};

export default function AdminServiceRequestsPage() {
  const [rows, setRows] = useState<ServiceRequestRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const qs = typeFilter ? `?type=${typeFilter}` : '';
      const res = await api.get<ApiResponse<ServiceRequestRow> & { items: ServiceRequestRow[] }>(
        `/admin/service-requests${qs}`,
      );
      setRows(res.items ?? []);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [typeFilter]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/service-requests/${id}/status`, {
        status,
        adminNote: adminNotes[id] || undefined,
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader title="Hizmet Talepleri" description="Üyelerden gelen oda hizmet talepleri" />
      {error && <ErrorBlock message={error} />}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTypeFilter('')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${!typeFilter ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200'}`}>
          Tümü
        </button>
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${typeFilter === t ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200'}`}>
            {typeLabels[t]}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
          Talep bulunamadı.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-iteo-gray-200 bg-white p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-iteo-black">{row.title}</p>
                  <p className="text-xs text-iteo-gray-500">
                    {typeLabels[row.type] ?? row.type} · {new Date(row.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                <span className="rounded-full bg-iteo-gray-100 px-2 py-0.5 text-xs font-medium">
                  {statusLabels[row.status] ?? row.status}
                </span>
              </div>
              {row.description && <p className="text-sm text-iteo-gray-700">{row.description}</p>}
              {row.plateNumber && <p className="text-xs text-iteo-gray-500">Plaka: {row.plateNumber}</p>}
              {row.locationAddress && <p className="text-xs text-iteo-gray-500">Konum: {row.locationAddress}</p>}
              {row.adminNote && <p className="text-xs text-iteo-gray-500">Not: {row.adminNote}</p>}
              <input
                value={adminNotes[row.id] ?? ''}
                onChange={(e) => setAdminNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                placeholder="Admin notu (isteğe bağlı)"
                className="w-full rounded-lg border border-iteo-gray-200 px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={updatingId === row.id || row.status === status}
                    onClick={() => updateStatus(row.id, status)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${row.status === status ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200'}`}>
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
