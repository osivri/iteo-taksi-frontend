'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader, StatCard } from '@/components/admin/AdminUi';

interface FinanceRow {
  id: string;
  type: string;
  category: string;
  amount: number;
  recordDate: string;
  vehicleId: string | null;
  plateNumber: string | null;
  memberName: string | null;
  receiptImageUrl: string | null;
  description: string | null;
  receiptOcrData?: { amount: number | null } | null;
}

interface Vehicle {
  id: string;
  plateNumber: string;
}

interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  currency: string;
}

interface FinanceAnalytics {
  monthlyFinance: { income: number; expense: number; net: number };
  topExpenseCategories: Array<{ category: string; total: number }>;
  ocrScanCount: number;
}

type Period = 'all' | 'month' | 'week';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function periodRange(period: Period): { from?: string; to?: string } {
  if (period === 'all') return {};
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  if (period === 'month') fromDate.setDate(fromDate.getDate() - 30);
  else fromDate.setDate(fromDate.getDate() - 7);
  return { from: fromDate.toISOString().slice(0, 10), to };
}

export default function FinanceAdminPage() {
  const [rows, setRows] = useState<FinanceRow[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [analytics, setAnalytics] = useState<FinanceAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');
  const [typeFilter, setTypeFilter] = useState<'all' | 'INCOME' | 'EXPENSE'>('all');
  const [exporting, setExporting] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<FinanceRow | null>(null);
  const [showReceiptsOnly, setShowReceiptsOnly] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<Vehicle[]>>('/vehicles')
      .then((res) => setVehicles(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVehicles([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const range = periodRange(period);
      const params = new URLSearchParams({ limit: '100' });
      if (range.from) {
        params.set('from', range.from);
        params.set('to', range.to!);
      }
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (vehicleFilter) params.set('vehicleId', vehicleFilter);

      const summaryParams = new URLSearchParams();
      if (range.from) {
        summaryParams.set('from', range.from);
        summaryParams.set('to', range.to!);
      }
      if (vehicleFilter) summaryParams.set('vehicleId', vehicleFilter);
      const summaryQs = summaryParams.toString() ? `?${summaryParams}` : '';

      const [recordsRes, summaryRes, analyticsRes] = await Promise.all([
        api.get<ApiResponse<FinanceRow> & { items: FinanceRow[] }>(
          `/admin/finance/records?${params}`,
        ),
        api.get<ApiResponse<FinanceSummary>>(`/admin/finance/summary${summaryQs}`),
        api.get<ApiResponse<FinanceAnalytics>>('/admin/finance/analytics'),
      ]);

      setRows(recordsRes.items ?? []);
      setSummary(summaryRes.data ?? null);
      setAnalytics(analyticsRes.data ?? null);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [period, typeFilter, vehicleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function exportCsv() {
    setExporting(true);
    try {
      const range = periodRange(period);
      const params = new URLSearchParams();
      if (range.from) {
        params.set('from', range.from);
        params.set('to', range.to!);
      }
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (vehicleFilter) params.set('vehicleId', vehicleFilter);

      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Oturum bulunamadı');

      const response = await fetch(`${API_URL}/admin/finance/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Dışa aktarma başarısız');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'iteo-finance-export.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExporting(false);
    }
  }

  const displayedRows = showReceiptsOnly ? rows.filter((r) => r.receiptImageUrl) : rows;
  const maxCategory = analytics?.topExpenseCategories[0]?.total ?? 1;

  if (loading && !summary) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Muhasebe Yönetimi"
        description="Üye kayıtları, plaka bazlı fişler ve dönemsel raporlar"
      />
      {error && <ErrorBlock message={error} />}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-iteo-gray-200 bg-white p-4 shadow-sm">
        {(['week', 'month', 'all'] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              period === p
                ? 'bg-iteo-yellow text-iteo-black'
                : 'border border-iteo-gray-200 bg-white text-iteo-gray-700'
            }`}>
            {p === 'week' ? '7 Gün' : p === 'month' ? '30 Gün' : 'Tümü'}
          </button>
        ))}
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="rounded-lg border border-iteo-gray-200 px-3 py-1.5 text-sm">
          <option value="">Tüm plakalar</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.plateNumber}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="rounded-lg border border-iteo-gray-200 px-3 py-1.5 text-sm">
          <option value="all">Tüm tipler</option>
          <option value="INCOME">Gelir</option>
          <option value="EXPENSE">Gider</option>
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-iteo-gray-200 px-3 py-1.5 text-sm">
          <input
            type="checkbox"
            checked={showReceiptsOnly}
            onChange={(e) => setShowReceiptsOnly(e.target.checked)}
          />
          Sadece fişli kayıtlar
        </label>
        <button
          type="button"
          onClick={exportCsv}
          disabled={exporting}
          className="ml-auto rounded-lg border border-iteo-gray-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-iteo-gray-100 disabled:opacity-60">
          {exporting ? 'İndiriliyor...' : 'CSV İndir'}
        </button>
      </div>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Toplam Gelir" value={`${summary.totalIncome.toLocaleString('tr-TR')} ₺`} />
          <StatCard label="Toplam Gider" value={`${summary.totalExpense.toLocaleString('tr-TR')} ₺`} />
          <StatCard
            label="Net"
            value={`${summary.net.toLocaleString('tr-TR')} ₺`}
            hint={summary.net >= 0 ? 'Pozitif bakiye' : 'Negatif bakiye'}
          />
        </div>
      )}

      {analytics && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-iteo-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-iteo-black">Gider Kategorileri (Top 8)</h3>
            <div className="space-y-3">
              {analytics.topExpenseCategories.map((c) => (
                <div key={c.category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{c.category}</span>
                    <span className="font-semibold">{c.total.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="h-2 rounded-full bg-iteo-gray-100">
                    <div
                      className="h-2 rounded-full bg-iteo-yellow"
                      style={{ width: `${(c.total / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <StatCard label="Akıllı Okunan Fiş" value={analytics.ocrScanCount} />
            <StatCard
              label="Bu Ay Üye Net"
              value={`${analytics.monthlyFinance.net.toLocaleString('tr-TR')} ₺`}
              hint={`Gelir ${analytics.monthlyFinance.income.toLocaleString('tr-TR')} · Gider ${analytics.monthlyFinance.expense.toLocaleString('tr-TR')}`}
            />
          </div>
        </div>
      )}

      {loading ? (
        <LoadingBlock />
      ) : displayedRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-iteo-gray-200 bg-white p-10 text-center text-iteo-gray-500">
          {showReceiptsOnly ? 'Fişli kayıt bulunamadı.' : 'Kayıt bulunamadı.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-iteo-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-iteo-gray-200 bg-iteo-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Tarih</th>
                <th className="px-4 py-3 text-left font-semibold">Üye</th>
                <th className="px-4 py-3 text-left font-semibold">Plaka</th>
                <th className="px-4 py-3 text-left font-semibold">Tip</th>
                <th className="px-4 py-3 text-left font-semibold">Kategori</th>
                <th className="px-4 py-3 text-left font-semibold">Tutar</th>
                <th className="px-4 py-3 text-left font-semibold">Fiş</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((r) => (
                <tr key={r.id} className="border-b border-iteo-gray-100 last:border-0">
                  <td className="px-4 py-3 text-iteo-gray-700">
                    {new Date(r.recordDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-iteo-gray-700">{r.memberName ?? '—'}</td>
                  <td className="px-4 py-3 font-medium text-iteo-black">{r.plateNumber ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {r.type === 'INCOME' ? 'Gelir' : 'Gider'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td
                    className={`px-4 py-3 font-semibold tabular-nums ${
                      r.type === 'INCOME' ? 'text-green-700' : 'text-red-700'
                    }`}>
                    {r.type === 'INCOME' ? '+' : '−'}
                    {r.amount.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-4 py-3">
                    {r.receiptImageUrl ? (
                      <button
                        type="button"
                        onClick={() => setReceiptPreview(r)}
                        className="text-xs font-semibold text-iteo-yellow hover:underline">
                        Görüntüle
                        {r.receiptOcrData?.amount != null && ` (${r.receiptOcrData.amount} ₺)`}
                      </button>
                    ) : (
                      <span className="text-xs text-iteo-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {receiptPreview?.receiptImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setReceiptPreview(null)}>
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-iteo-gray-100 bg-iteo-black px-5 py-4">
              <h3 className="font-bold text-white">Fiş Detayı</h3>
              <p className="mt-1 text-xs text-white/70">
                {receiptPreview.plateNumber ?? 'Plaka yok'} · {receiptPreview.memberName ?? 'Üye'} ·{' '}
                {receiptPreview.category} · {receiptPreview.amount.toLocaleString('tr-TR')} ₺
              </p>
            </div>
            <div className="space-y-4 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={receiptPreview.receiptImageUrl}
                alt="Fiş"
                className="max-h-[60vh] w-full rounded-xl border border-iteo-gray-200 object-contain bg-iteo-gray-50"
              />
              {receiptPreview.description && (
                <p className="text-sm text-iteo-gray-600">{receiptPreview.description}</p>
              )}
              <div className="flex gap-2">
                <a
                  href={receiptPreview.receiptImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl bg-iteo-yellow py-2.5 text-center text-sm font-bold text-iteo-black">
                  Yeni sekmede aç
                </a>
                <button
                  type="button"
                  onClick={() => setReceiptPreview(null)}
                  className="rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-sm">
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
