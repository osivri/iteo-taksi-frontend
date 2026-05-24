'use client';

import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  role: string;
  status: string;
}

const roles = ['USER', 'DRIVER', 'PLATE_OWNER', 'ADMIN', 'SUPER_ADMIN'] as const;
const statuses = ['ACTIVE', 'PASSIVE', 'PENDING_VERIFICATION'] as const;

const roleLabels: Record<string, string> = {
  USER: 'Üye',
  DRIVER: 'Şoför',
  PLATE_OWNER: 'Plaka Sahibi',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Süper Admin',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  PASSIVE: 'Pasif',
  PENDING_VERIFICATION: 'Doğrulama Bekliyor',
};

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<UserRow> & { items: UserRow[] }>('/admin/users');
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

  async function updateUser(id: string, patch: { role?: string; status?: string }) {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/users/${id}`, patch);
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
      <PageHeader title="Kullanıcı Yönetimi" description="Üye, şoför ve plaka sahibi kayıtları" />
      {error && <ErrorBlock message={error} />}

      <div className="overflow-x-auto rounded-xl border border-iteo-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-iteo-gray-200 bg-iteo-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Ad Soyad</th>
              <th className="px-4 py-3 text-left font-semibold">Telefon</th>
              <th className="px-4 py-3 text-left font-semibold">Rol</th>
              <th className="px-4 py-3 text-left font-semibold">Durum</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-iteo-gray-500">
                  Kayıt bulunamadı
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-iteo-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    {row.firstName} {row.lastName}
                  </td>
                  <td className="px-4 py-3">{row.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={row.role}
                      disabled={updatingId === row.id}
                      onChange={(e) => updateUser(row.id, { role: e.target.value })}
                      className="rounded-lg border border-iteo-gray-200 px-2 py-1.5 text-sm"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {roleLabels[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.status}
                      disabled={updatingId === row.id}
                      onChange={(e) => updateUser(row.id, { status: e.target.value })}
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
