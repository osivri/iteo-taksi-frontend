'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  district: string | null;
  addressLine: string | null;
  role: string;
  status: string;
}

interface UserDocument {
  id: string;
  userId: string;
  type: string;
  fileUrl: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

const roles = ['USER', 'DRIVER', 'PLATE_OWNER', 'ADMIN', 'SUPER_ADMIN'] as const;
const statuses = ['ACTIVE', 'PASSIVE', 'PENDING_VERIFICATION'] as const;

const roleLabels: Record<string, string> = {
  USER: 'Oda Üyesi',
  DRIVER: 'Şoför',
  PLATE_OWNER: 'Oda Üyesi',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Süper Admin',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  PASSIVE: 'Pasif',
  PENDING_VERIFICATION: 'Doğrulama Bekliyor',
};

const documentTypeLabels: Record<string, string> = {
  DRIVERS_LICENSE: 'Ehliyet',
  VEHICLE_REGISTRATION: 'Ruhsat',
  SRC_CERTIFICATE: 'SRC Sertifikası',
  OTHER: 'Diğer',
};

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [documentsUserId, setDocumentsUserId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search.trim()) params.set('search', search.trim());
      const res = await api.get<ApiResponse<UserRow> & { items: UserRow[]; meta: typeof meta }>(
        `/admin/users?${params.toString()}`,
      );
      setRows(res.items ?? []);
      setMeta(res.meta ?? { page, limit: PAGE_SIZE, total: 0 });
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load(1);
  }, [load]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  async function updateUser(id: string, patch: { role?: string; status?: string }) {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/users/${id}`, patch);
      await load(meta.page);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function openDocuments(userId: string) {
    setDocumentsUserId(userId);
    setDocumentsLoading(true);
    setDocuments([]);
    try {
      const res = await api.get<ApiResponse<UserDocument[]>>(`/admin/user-documents/user/${userId}`);
      setDocuments(res.data ?? []);
    } catch (e) {
      setError((e as Error).message);
      setDocumentsUserId(null);
    } finally {
      setDocumentsLoading(false);
    }
  }

  async function reviewDocument(id: string, status: 'APPROVED' | 'REJECTED') {
    setReviewingId(id);
    try {
      await api.patch(`/admin/user-documents/${id}/review`, { status });
      if (documentsUserId) {
        const res = await api.get<ApiResponse<UserDocument[]>>(
          `/admin/user-documents/user/${documentsUserId}`,
        );
        setDocuments(res.data ?? []);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setReviewingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  if (loading && rows.length === 0) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader title="Kullanıcı Yönetimi" description="Oda üyesi, şoför ve yönetici kayıtları" />
      {error && <ErrorBlock message={error} />}

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Ad, soyad, telefon veya e-posta ara..."
          className="min-w-[240px] flex-1 rounded-lg border border-iteo-gray-200 px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-iteo-yellow px-4 py-2.5 text-sm font-semibold text-iteo-black"
        >
          Ara
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-iteo-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-iteo-gray-200 bg-iteo-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Ad Soyad</th>
              <th className="px-4 py-3 text-left font-semibold">E-posta</th>
              <th className="px-4 py-3 text-left font-semibold">Telefon</th>
              <th className="px-4 py-3 text-left font-semibold">Adres</th>
              <th className="px-4 py-3 text-left font-semibold">Rol</th>
              <th className="px-4 py-3 text-left font-semibold">Durum</th>
              <th className="px-4 py-3 text-left font-semibold">Belgeler</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-iteo-gray-500">
                  Kayıt bulunamadı
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-iteo-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    {row.firstName} {row.lastName}
                  </td>
                  <td className="px-4 py-3">{row.email ?? '—'}</td>
                  <td className="px-4 py-3">{row.phone ?? '—'}</td>
                  <td className="max-w-xs truncate px-4 py-3" title={row.addressLine ?? undefined}>
                    {row.city && row.district ? `${row.city} / ${row.district}` : '—'}
                  </td>
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
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openDocuments(row.id)}
                      className="rounded-lg border border-iteo-gray-200 px-2.5 py-1 text-xs font-medium hover:bg-iteo-gray-100"
                    >
                      İncele
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-iteo-gray-600">
          <p>
            Toplam {meta.total} kayıt — Sayfa {meta.page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.page <= 1 || loading}
              onClick={() => load(meta.page - 1)}
              className="rounded-lg border border-iteo-gray-200 px-3 py-1.5 disabled:opacity-50"
            >
              Önceki
            </button>
            <button
              type="button"
              disabled={meta.page >= totalPages || loading}
              onClick={() => load(meta.page + 1)}
              className="rounded-lg border border-iteo-gray-200 px-3 py-1.5 disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

      {documentsUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-iteo-black">Kullanıcı Belgeleri</h2>
              <button
                type="button"
                onClick={() => setDocumentsUserId(null)}
                className="rounded-lg px-2 py-1 text-sm text-iteo-gray-500 hover:bg-iteo-gray-100"
              >
                Kapat
              </button>
            </div>
            {documentsLoading ? (
              <p className="text-sm text-iteo-gray-500">Yükleniyor...</p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-iteo-gray-500">Yüklenmiş belge yok.</p>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-iteo-gray-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-iteo-black">
                          {documentTypeLabels[doc.type] ?? doc.type}
                        </p>
                        <p className="mt-1 text-xs text-iteo-gray-500">
                          Durum: {doc.status} ·{' '}
                          {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                        {doc.adminNote && (
                          <p className="mt-1 text-xs text-iteo-gray-600">Not: {doc.adminNote}</p>
                        )}
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-iteo-yellow hover:underline"
                      >
                        Belgeyi Aç
                      </a>
                    </div>
                    {doc.status === 'PENDING' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={reviewingId === doc.id}
                          onClick={() => reviewDocument(doc.id, 'APPROVED')}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                        >
                          Onayla
                        </button>
                        <button
                          type="button"
                          disabled={reviewingId === doc.id}
                          onClick={() => reviewDocument(doc.id, 'REJECTED')}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 disabled:opacity-50"
                        >
                          Reddet
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
