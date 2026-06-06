'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { CrudTable, EditModal, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface SparePartRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  status: string;
}

interface OrderRow {
  id: string;
  partName?: string;
  quantity: number;
  status: string;
  note: string | null;
  adminNote: string | null;
  createdAt: string;
}

const partStatusLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  PASSIVE: 'Pasif',
};

const orderStatusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  PROCESSING: 'İşleniyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

const orderStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const;

type Tab = 'parts' | 'orders';

export default function AdminSparePartsPage() {
  const [tab, setTab] = useState<Tab>('parts');
  const [parts, setParts] = useState<SparePartRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SparePartRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [status, setStatus] = useState('ACTIVE');

  async function loadParts() {
    const res = await api.get<ApiResponse<SparePartRow> & { items: SparePartRow[] }>('/admin/spare-parts');
    setParts(res.items ?? []);
  }

  async function loadOrders() {
    const res = await api.get<ApiResponse<OrderRow> & { items: OrderRow[] }>('/admin/spare-parts/orders');
    setOrders(res.items ?? []);
  }

  async function load() {
    setLoading(true);
    try {
      if (tab === 'parts') await loadParts();
      else await loadOrders();
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/spare-parts', {
        name,
        description: description || undefined,
        category,
        price: Number(price),
        stock: Number(stock),
        status,
      });
      setName('');
      setDescription('');
      setCategory('');
      setPrice('');
      setStock('0');
      await loadParts();
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
      await api.patch(`/admin/spare-parts/${editing.id}`, {
        name: editing.name,
        description: editing.description || undefined,
        category: editing.category,
        price: editing.price,
        stock: editing.stock,
        status: editing.status,
      });
      setEditing(null);
      await loadParts();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEditSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu parçayı silmek istediğinize emin misiniz?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/spare-parts/${id}`);
      await loadParts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  async function updateOrderStatus(id: string, status: string) {
    setUpdatingOrderId(id);
    try {
      await api.patch(`/admin/spare-parts/orders/${id}`, { status });
      await loadOrders();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader title="Yedek Parça" description="Parça kataloğu ve sipariş talepleri" />
      {error && <ErrorBlock message={error} />}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('parts')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'parts' ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200'}`}>
          Katalog
        </button>
        <button
          type="button"
          onClick={() => setTab('orders')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'orders' ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200'}`}>
          Siparişler
        </button>
      </div>

      {tab === 'parts' && (
        <>
          <form onSubmit={handleCreate} className="space-y-4 rounded-2xl border border-iteo-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-iteo-black">Yeni Parça</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Parça adı"
                required
                className="rounded-xl border border-iteo-gray-200 px-4 py-2.5"
              />
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Kategori"
                required
                className="rounded-xl border border-iteo-gray-200 px-4 py-2.5"
              />
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Fiyat (₺)"
                type="number"
                min="0"
                required
                className="rounded-xl border border-iteo-gray-200 px-4 py-2.5"
              />
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stok"
                type="number"
                min="0"
                className="rounded-xl border border-iteo-gray-200 px-4 py-2.5"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Açıklama (isteğe bağlı)"
              rows={2}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
            <button
              type="submit"
              disabled={saving || !name || !category || !price}
              className="rounded-xl bg-iteo-yellow px-4 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-50">
              {saving ? 'Kaydediliyor...' : 'Parça Ekle'}
            </button>
          </form>

          <CrudTable
            columns={[
              { key: 'name', label: 'Ad' },
              { key: 'category', label: 'Kategori' },
              { key: 'price', label: 'Fiyat' },
              { key: 'stock', label: 'Stok' },
              { key: 'status', label: 'Durum' },
            ]}
            rows={parts.map((r) => ({
              id: r.id,
              cells: {
                name: r.name,
                category: r.category,
                price: `${r.price.toLocaleString('tr-TR')} ₺`,
                stock: r.stock,
                status: partStatusLabels[r.status] ?? r.status,
              },
            }))}
            onEdit={(id) => {
              const row = parts.find((r) => r.id === id);
              if (row) setEditing({ ...row });
            }}
            onDelete={remove}
            deletingId={deletingId}
          />

          <EditModal
            title="Parça Düzenle"
            open={!!editing}
            saving={editSaving}
            onClose={() => setEditing(null)}
            onSubmit={saveEdit}>
            {editing && (
              <>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Parça adı"
                  required
                  className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
                />
                <input
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  placeholder="Kategori"
                  required
                  className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
                />
                <input
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  type="number"
                  min="0"
                  placeholder="Fiyat"
                  className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
                />
                <input
                  value={editing.stock}
                  onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                  type="number"
                  min="0"
                  placeholder="Stok"
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
        </>
      )}

      {tab === 'orders' && (
        <>
          {orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
              Sipariş bulunamadı.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-iteo-gray-200 bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-iteo-black">{order.partName ?? 'Parça'}</p>
                      <p className="text-xs text-iteo-gray-500">
                        Adet: {order.quantity} · {new Date(order.createdAt).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <span className="rounded-full bg-iteo-gray-100 px-2 py-0.5 text-xs font-medium">
                      {orderStatusLabels[order.status] ?? order.status}
                    </span>
                  </div>
                  {order.note && <p className="text-sm text-iteo-gray-700">{order.note}</p>}
                  {order.adminNote && <p className="text-xs text-iteo-gray-500">Not: {order.adminNote}</p>}
                  <div className="flex flex-wrap gap-2">
                    {orderStatuses.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={updatingOrderId === order.id || order.status === s}
                        onClick={() => updateOrderStatus(order.id, s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${order.status === s ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200'}`}>
                        {orderStatusLabels[s]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
