'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface ForgottenItemRow {
  id: string;
  plateNumber: string;
  description: string;
  photoUrl: string | null;
  status: string;
  adminNote: string | null;
  reporterName?: string;
  createdAt: string;
}

const statuses = ['PENDING', 'REVIEWING', 'RETURNED', 'CLOSED'] as const;

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  REVIEWING: 'İnceleniyor',
  RETURNED: 'Teslim edildi',
  CLOSED: 'Kapatıldı',
};

export default function AdminForgottenItemsPage() {
  const [rows, setRows] = useState<ForgottenItemRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<ForgottenItemRow> & { items: ForgottenItemRow[] }>(
        '/admin/forgotten-items',
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
      await api.patch(`/admin/forgotten-items/${id}/status`, { status });
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
      <PageHeader title="Unutulan Eşya Bildirimleri" description="Şoför ve mal sahiplerinden gelen bildirimler" />
      {error && <ErrorBlock message={error} />}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
          Henüz bildirim yok.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => (
            <div key={row.id} className="overflow-hidden rounded-xl border border-iteo-gray-200 bg-white">
              {row.photoUrl && (
                <a href={row.photoUrl} target="_blank" rel="noopener noreferrer" className="relative block h-48 bg-iteo-gray-100">
                  <Image src={row.photoUrl} alt={row.description} fill className="object-cover" unoptimized />
                </a>
              )}
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-iteo-black">{row.plateNumber}</p>
                    <p className="text-xs text-iteo-gray-500">{row.reporterName ?? 'Üye'} · {new Date(row.createdAt).toLocaleString('tr-TR')}</p>
                  </div>
                  <span className="rounded-full bg-iteo-gray-100 px-2 py-0.5 text-xs font-medium">{statusLabels[row.status] ?? row.status}</span>
                </div>
                <p className="text-sm text-iteo-gray-700">{row.description}</p>
                {row.adminNote && <p className="text-xs text-iteo-gray-500">Not: {row.adminNote}</p>}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
