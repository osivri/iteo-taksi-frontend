'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { DataTable, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface StaffExpenseRow {
  id: string;
  staffName?: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string | null;
  createdAt: string;
}

export default function AdminStaffExpensesPage() {
  const [rows, setRows] = useState<StaffExpenseRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get<ApiResponse<StaffExpenseRow> & { items: StaffExpenseRow[] }>(
        `/staff-expenses${qs}`,
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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await api.post('/staff-expenses', {
        category: category.trim(),
        amount: Number(amount),
        expenseDate,
        description: description.trim() || undefined,
      });
      setCategory('');
      setAmount('');
      setExpenseDate('');
      setDescription('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  if (loading && rows.length === 0) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader title="Personel Giderleri" description="Personel gider kayıtları" />
      {error && <ErrorBlock message={error} />}

      <form
        onSubmit={handleCreate}
        className="grid gap-4 rounded-xl border border-iteo-gray-200 bg-white p-4 sm:grid-cols-2"
      >
        <h2 className="sm:col-span-2 text-sm font-semibold text-iteo-black">Yeni Gider Kaydı</h2>
        <label className="space-y-1">
          <span className="text-xs font-medium text-iteo-gray-500">Kategori</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="Örn. Yakıt, Yemek"
            className="w-full rounded-lg border border-iteo-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-iteo-gray-500">Tutar (₺)</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full rounded-lg border border-iteo-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-iteo-gray-500">Tarih</span>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
            className="w-full rounded-lg border border-iteo-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-medium text-iteo-gray-500">Açıklama</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="İsteğe bağlı"
            className="w-full rounded-lg border border-iteo-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-iteo-yellow px-4 py-2 text-sm font-semibold text-iteo-black disabled:opacity-60 sm:col-span-2 sm:w-fit"
        >
          {creating ? 'Kaydediliyor...' : 'Gider Ekle'}
        </button>
      </form>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-iteo-gray-200 bg-white p-4">
        <label className="space-y-1">
          <span className="text-xs font-medium text-iteo-gray-500">Başlangıç</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="block rounded-lg border border-iteo-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-iteo-gray-500">Bitiş</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="block rounded-lg border border-iteo-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={load}
          className="rounded-lg bg-iteo-yellow px-4 py-2 text-sm font-semibold text-iteo-black"
        >
          Filtrele
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'staffName', label: 'Personel' },
          { key: 'category', label: 'Kategori' },
          { key: 'amount', label: 'Tutar' },
          { key: 'expenseDate', label: 'Tarih' },
          { key: 'description', label: 'Açıklama' },
        ]}
        rows={rows.map((r) => ({
          staffName: r.staffName ?? '—',
          category: r.category,
          amount: `${r.amount.toLocaleString('tr-TR')} ₺`,
          expenseDate: new Date(r.expenseDate).toLocaleDateString('tr-TR'),
          description: r.description,
        }))}
        emptyMessage="Gider kaydı bulunamadı."
      />
    </div>
  );
}
