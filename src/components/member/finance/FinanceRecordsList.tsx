'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/admin/AdminUi';
import { IteoIcon } from '@/components/ui/icons';
import type { FinanceTypeFilter } from '@/lib/finance-period';
import { FinanceTypeFilter as FinanceTypeFilterTabs } from '@/components/member/FinancePeriodTabs';

interface FinanceRow {
  id: string;
  type: string;
  category: string;
  amount: number;
  recordDate: string;
  vehicleId: string | null;
  receiptImageUrl: string | null;
  receiptOcrData?: {
    amount: number | null;
  } | null;
}

interface Props {
  rows: FinanceRow[];
  plateById: Record<string, string>;
  typeFilter: FinanceTypeFilter;
  onTypeFilterChange: (filter: FinanceTypeFilter) => void;
  periodLabel: string;
  loading: boolean;
  saving: boolean;
  onAttachReceipt: (recordId: string) => void;
}

const typeLabels: Record<string, string> = {
  INCOME: 'Gelir',
  EXPENSE: 'Gider',
};

export function FinanceRecordsList({
  rows,
  plateById,
  typeFilter,
  onTypeFilterChange,
  periodLabel,
  loading,
  saving,
  onAttachReceipt,
}: Props) {
  const [receiptPreview, setReceiptPreview] = useState<FinanceRow | null>(null);

  return (
    <>
    <section className="overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-iteo-gray-100 px-4 py-5 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-iteo-gray-100">
            <IteoIcon name="receipt" size={20} className="text-iteo-black/70" />
          </div>
          <div>
            <h2 className="text-base font-bold text-iteo-black">Hareketler</h2>
            <p className="mt-0.5 text-sm text-iteo-gray-500">{periodLabel}</p>
          </div>
        </div>
        <FinanceTypeFilterTabs value={typeFilter} onChange={onTypeFilterChange} />
      </div>

      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-iteo-gray-100" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon="finance"
            title="Bu dönemde kayıt yok"
            description="Soldan gelir/gider ekleyin veya fiş tarayarak başlayın."
          />
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => {
              const isIncome = r.type === 'INCOME';
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl border border-iteo-gray-100 bg-iteo-gray-50/50 p-3 transition-colors hover:border-iteo-gray-200 hover:bg-white sm:p-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                      isIncome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {isIncome ? '+' : '−'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-iteo-black">{r.category}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {typeLabels[r.type] ?? r.type}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-iteo-gray-500">
                      {new Date(r.recordDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      {r.vehicleId && plateById[r.vehicleId] ? ` · ${plateById[r.vehicleId]}` : ''}
                    </p>
                    {r.receiptImageUrl ? (
                      <button
                        type="button"
                        onClick={() => setReceiptPreview(r)}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:underline">
                        Fiş görüntüle
                        {r.receiptOcrData?.amount != null && ` · ${r.receiptOcrData.amount} ₺`}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAttachReceipt(r.id)}
                        disabled={saving}
                        className="mt-1 text-xs font-semibold text-iteo-yellow hover:underline disabled:opacity-50">
                        + Fiş ekle
                      </button>
                    )}
                  </div>
                  <p
                    className={`shrink-0 text-base font-bold tabular-nums sm:text-lg ${
                      isIncome ? 'text-green-700' : 'text-red-700'
                    }`}>
                    {isIncome ? '+' : '−'}
                    {r.amount.toLocaleString('tr-TR')} ₺
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>

    {receiptPreview?.receiptImageUrl && (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
        onClick={() => setReceiptPreview(null)}>
        <div
          className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}>
          <div className="border-b border-iteo-gray-100 bg-iteo-black px-5 py-4">
            <h3 className="font-bold text-white">Fiş</h3>
            <p className="mt-1 text-xs text-white/70">
              {receiptPreview.vehicleId && plateById[receiptPreview.vehicleId]
                ? plateById[receiptPreview.vehicleId]
                : 'Plaka'}{' '}
              · {receiptPreview.category} · {receiptPreview.amount.toLocaleString('tr-TR')} ₺
            </p>
          </div>
          <div className="space-y-4 p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receiptPreview.receiptImageUrl}
              alt="Fiş"
              className="max-h-[60vh] w-full rounded-xl border border-iteo-gray-200 object-contain bg-iteo-gray-50"
            />
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
    </>
  );
}
