'use client';

import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface ListingRow {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  price: number;
  district: string | null;
  neighborhood: string | null;
  contactPhone: string | null;
  adminNote: string | null;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  VEHICLE_RENTAL: 'Araç Kiralama',
  PLATE_SALE: 'Plaka Satış',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Onay Bekliyor',
  APPROVED: 'Onaylı',
  REJECTED: 'Reddedildi',
};

export default function AdminListingsPage() {
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get<ApiResponse<ListingRow> & { items: ListingRow[] }>(
        `/admin/listings${qs}`,
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
  }, [statusFilter]);

  async function updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/listings/${id}/status`, {
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
      <PageHeader title="İlan Yönetimi" description="Üye ilanlarını onaylayın veya reddedin" />
      {error && <ErrorBlock message={error} />}

      <div className="flex flex-wrap gap-2">
        {(['PENDING', 'APPROVED', 'REJECTED', ''] as const).map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${statusFilter === s ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200'}`}>
            {s ? statusLabels[s] : 'Tümü'}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
          İlan bulunamadı.
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
              <p className="text-lg font-semibold text-iteo-black">
                {row.price.toLocaleString('tr-TR')} ₺
              </p>
              {row.description && <p className="text-sm text-iteo-gray-700">{row.description}</p>}
              {(row.district || row.neighborhood) && (
                <p className="text-xs text-iteo-gray-500">
                  {[row.district, row.neighborhood].filter(Boolean).join(' / ')}
                </p>
              )}
              {row.contactPhone && <p className="text-xs text-iteo-gray-500">Tel: {row.contactPhone}</p>}
              {row.adminNote && <p className="text-xs text-iteo-gray-500">Not: {row.adminNote}</p>}
              {row.status === 'PENDING' && (
                <>
                  <input
                    value={adminNotes[row.id] ?? ''}
                    onChange={(e) => setAdminNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                    placeholder="Admin notu (isteğe bağlı)"
                    className="w-full rounded-lg border border-iteo-gray-200 px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={updatingId === row.id}
                      onClick={() => updateStatus(row.id, 'APPROVED')}
                      className="rounded-lg bg-iteo-yellow px-4 py-2 text-xs font-semibold text-iteo-black disabled:opacity-50">
                      Onayla
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === row.id}
                      onClick={() => updateStatus(row.id, 'REJECTED')}
                      className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 disabled:opacity-50">
                      Reddet
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
