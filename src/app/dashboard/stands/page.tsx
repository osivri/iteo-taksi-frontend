'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { CrudTable, EditModal, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface StandRow {
  id: string;
  name: string;
  district: string;
  neighborhood: string | null;
  addressLine: string | null;
  status: string;
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  PASSIVE: 'Pasif',
};

export default function AdminStandsPage() {
  const [rows, setRows] = useState<StandRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<StandRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<StandRow> & { items: StandRow[] }>('/admin/stands');
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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/stands', {
        name,
        district,
        neighborhood: neighborhood || undefined,
        addressLine: addressLine || undefined,
        status,
      });
      setName('');
      setDistrict('');
      setNeighborhood('');
      setAddressLine('');
      setStatus('ACTIVE');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setEditSaving(true);
    try {
      await api.patch(`/admin/stands/${editing.id}`, {
        name: editing.name,
        district: editing.district,
        neighborhood: editing.neighborhood || undefined,
        addressLine: editing.addressLine || undefined,
        status: editing.status,
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEditSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu durağı silmek istediğinize emin misiniz?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/stands/${id}`);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader title="Durak Yönetimi" description="Taksi duraklarını ekleyin ve düzenleyin" />
      {error && <ErrorBlock message={error} />}

      <form onSubmit={handleCreate} className="space-y-4 rounded-2xl border border-iteo-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-iteo-black">Yeni Durak</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Durak adı"
            required
            className="rounded-xl border border-iteo-gray-200 px-4 py-2.5"
          />
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="İlçe"
            required
            className="rounded-xl border border-iteo-gray-200 px-4 py-2.5"
          />
          <input
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Mahalle (isteğe bağlı)"
            className="rounded-xl border border-iteo-gray-200 px-4 py-2.5"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-iteo-gray-200 px-4 py-2.5">
            <option value="ACTIVE">Aktif</option>
            <option value="PASSIVE">Pasif</option>
          </select>
        </div>
        <input
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          placeholder="Adres (isteğe bağlı)"
          className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
        />
        <button
          type="submit"
          disabled={saving || !name || !district}
          className="rounded-xl bg-iteo-yellow px-4 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-50">
          {saving ? 'Kaydediliyor...' : 'Durak Ekle'}
        </button>
      </form>

      <CrudTable
        columns={[
          { key: 'name', label: 'Ad' },
          { key: 'district', label: 'İlçe' },
          { key: 'neighborhood', label: 'Mahalle' },
          { key: 'status', label: 'Durum' },
        ]}
        rows={rows.map((r) => ({
          id: r.id,
          cells: {
            name: r.name,
            district: r.district,
            neighborhood: r.neighborhood,
            status: statusLabels[r.status] ?? r.status,
          },
        }))}
        onEdit={(id) => {
          const row = rows.find((r) => r.id === id);
          if (row) setEditing({ ...row });
        }}
        onDelete={remove}
        deletingId={deletingId}
      />

      <EditModal
        title="Durak Düzenle"
        open={!!editing}
        saving={editSaving}
        onClose={() => setEditing(null)}
        onSubmit={saveEdit}>
        {editing && (
          <>
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Durak adı"
              required
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
            <input
              value={editing.district}
              onChange={(e) => setEditing({ ...editing, district: e.target.value })}
              placeholder="İlçe"
              required
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
            <input
              value={editing.neighborhood ?? ''}
              onChange={(e) => setEditing({ ...editing, neighborhood: e.target.value || null })}
              placeholder="Mahalle"
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
            <input
              value={editing.addressLine ?? ''}
              onChange={(e) => setEditing({ ...editing, addressLine: e.target.value || null })}
              placeholder="Adres"
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
            <select
              value={editing.status}
              onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5">
              <option value="ACTIVE">Aktif</option>
              <option value="PASSIVE">Pasif</option>
            </select>
          </>
        )}
      </EditModal>
    </div>
  );
}
