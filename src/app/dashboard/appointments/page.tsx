'use client';

import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface AppointmentRow {
  id: string;
  type: string;
  status: string;
  requestedDate: string;
  plateNumber: string | null;
}

const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'] as const;

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

const typeLabels: Record<string, string> = {
  HOTEL: 'Otel',
  AUTO_SERVICE: 'Oto Servis',
};

export default function AppointmentsPage() {
  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<AppointmentRow> & { items: AppointmentRow[] }>(
        '/admin/appointments',
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
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/appointments/${id}/status`, { status });
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
      <PageHeader title="Randevu Yönetimi" description="Otel ve oto servis talepleri" />
      {error && <ErrorBlock message={error} />}

      <div className="overflow-x-auto rounded-xl border border-iteo-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-iteo-gray-200 bg-iteo-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Tip</th>
              <th className="px-4 py-3 text-left font-semibold">Durum</th>
              <th className="px-4 py-3 text-left font-semibold">Talep Tarihi</th>
              <th className="px-4 py-3 text-left font-semibold">Plaka</th>
              <th className="px-4 py-3 text-left font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-iteo-gray-500">
                  Kayıt bulunamadı
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-iteo-gray-100 last:border-0">
                  <td className="px-4 py-3">{typeLabels[row.type] ?? row.type}</td>
                  <td className="px-4 py-3">{statusLabels[row.status] ?? row.status}</td>
                  <td className="px-4 py-3">
                    {new Date(row.requestedDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">{row.plateNumber ?? '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={row.status}
                      disabled={updatingId === row.id}
                      onChange={(e) => updateStatus(row.id, e.target.value)}
                      className="rounded-lg border border-iteo-gray-200 px-2 py-1.5 text-sm"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
