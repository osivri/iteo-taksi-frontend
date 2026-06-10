'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { DataTable, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface FeeConfig {
  key: string;
  amount: number;
  currency: string;
  label: string | null;
  updatedAt: string | null;
}

const feeKeyLabels: Record<string, string> = {
  DUES: 'Oda Aidatı',
  APP_FEE: 'Uygulama Ücreti',
  SERVICE_FEE: 'Hizmet Bedeli',
};

export default function FeesPage() {
  const [fees, setFees] = useState<FeeConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<FeeConfig[]>>('/admin/fees');
      setFees(res.data ?? []);
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

  function startEdit(fee: FeeConfig) {
    setEditingKey(fee.key);
    setEditAmount(String(fee.amount));
    setEditLabel(fee.label ?? feeKeyLabels[fee.key] ?? fee.key);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editingKey) return;
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/admin/fees/${editingKey}`, {
        amount: Number(editAmount),
        label: editLabel.trim() || undefined,
      });
      setEditingKey(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader title="Tarife Yönetimi" description="Aidat ve hizmet ücretlerini güncelleyin" />
      {error && <ErrorBlock message={error} />}

      <DataTable
        columns={[
          { key: 'keyLabel', label: 'Tarife' },
          { key: 'amountLabel', label: 'Tutar' },
          { key: 'updatedAt', label: 'Son Güncelleme' },
        ]}
        rows={fees.map((fee) => ({
          keyLabel: fee.label ?? feeKeyLabels[fee.key] ?? fee.key,
          amountLabel: `${fee.amount.toLocaleString('tr-TR')} ${fee.currency}`,
          updatedAt: fee.updatedAt
            ? new Date(fee.updatedAt).toLocaleString('tr-TR')
            : 'Varsayılan',
        }))}
        emptyMessage="Tarife bulunamadı"
      />

      <div className="flex flex-wrap gap-2">
        {fees.map((fee) => (
          <button
            key={fee.key}
            type="button"
            onClick={() => startEdit(fee)}
            className="rounded-lg border border-iteo-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-iteo-gray-100"
          >
            {fee.label ?? feeKeyLabels[fee.key] ?? fee.key} Düzenle
          </button>
        ))}
      </div>

      {editingKey && (
        <form
          onSubmit={handleSave}
          className="max-w-md space-y-4 rounded-xl border border-iteo-gray-200 bg-white p-5"
        >
          <h2 className="font-semibold text-iteo-black">
            {feeKeyLabels[editingKey] ?? editingKey} Güncelle
          </h2>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-iteo-gray-500">Tutar (₺)</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              required
              className="w-full rounded-lg border border-iteo-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-iteo-gray-500">Etiket</span>
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="w-full rounded-lg border border-iteo-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-iteo-yellow px-4 py-2 text-sm font-semibold text-iteo-black disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={() => setEditingKey(null)}
              className="rounded-lg border border-iteo-gray-200 px-4 py-2 text-sm"
            >
              İptal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
