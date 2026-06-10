'use client';

import { FormEvent } from 'react';
import { IteoIcon } from '@/components/ui/icons';

const QUICK_CATEGORIES = {
  EXPENSE: ['Yakıt', 'Bakım', 'Sigorta', 'Vergi', 'Yıkama', 'Diğer'],
  INCOME: ['Hasılat', 'Nakit', 'Kart', 'Diğer'],
};

interface Props {
  type: 'INCOME' | 'EXPENSE';
  onTypeChange: (type: 'INCOME' | 'EXPENSE') => void;
  category: string;
  onCategoryChange: (value: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  recordDate: string;
  onRecordDateChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  pendingReceiptUrl: string | null;
  onRemoveReceipt: () => void;
  onReceiptClick: () => void;
  onSubmit: (e: FormEvent) => void;
  saving: boolean;
  disabled: boolean;
  plateLabel?: string;
}

export function FinanceEntryForm({
  type,
  onTypeChange,
  category,
  onCategoryChange,
  amount,
  onAmountChange,
  recordDate,
  onRecordDateChange,
  description,
  onDescriptionChange,
  pendingReceiptUrl,
  onRemoveReceipt,
  onReceiptClick,
  onSubmit,
  saving,
  disabled,
  plateLabel,
}: Props) {
  const quickCategories = QUICK_CATEGORIES[type];

  return (
    <section className="overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-iteo-gray-100 bg-gradient-to-r from-iteo-yellow/15 to-white px-4 py-5 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-iteo-yellow">
            <IteoIcon name="finance" size={20} className="text-iteo-black" />
          </div>
          <div>
            <h2 className="text-base font-bold text-iteo-black">Yeni kayıt</h2>
            <p className="mt-0.5 text-sm text-iteo-gray-500">
              {plateLabel ? `${plateLabel} için gelir veya gider` : 'Plaka seçin'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReceiptClick}
          disabled={saving || disabled}
          className="inline-flex items-center gap-2 rounded-xl border border-iteo-black/10 bg-iteo-black px-3 py-2.5 text-xs font-semibold text-iteo-yellow transition hover:bg-iteo-black-soft disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm">
          <IteoIcon name="receipt" size={16} />
          {saving ? 'Yükleniyor...' : 'Fiş tara'}
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 p-4 sm:p-5">
        {disabled && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3">
            <IteoIcon name="taxi" size={20} className="shrink-0 text-amber-700" />
            <p className="text-sm text-amber-900">
              Kayıt eklemek için önce <strong>plaka seçin</strong>.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-iteo-gray-100 p-1">
          {(['EXPENSE', 'INCOME'] as const).map((t) => {
            const active = type === t;
            const isExpense = t === 'EXPENSE';
            return (
              <button
                key={t}
                type="button"
                disabled={disabled}
                onClick={() => onTypeChange(t)}
                className={`rounded-lg py-3 text-sm font-bold transition-all duration-200 disabled:opacity-50 ${
                  active
                    ? isExpense
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-green-600 text-white shadow-sm'
                    : 'text-iteo-gray-600 hover:text-iteo-black'
                }`}>
                {isExpense ? '− Gider' : '+ Gelir'}
              </button>
            );
          })}
        </div>

        <div>
          <label htmlFor="finance-amount" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">
            Tutar (₺)
          </label>
          <input
            id="finance-amount"
            type="number"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            required
            min="0"
            step="0.01"
            disabled={disabled}
            className="w-full rounded-xl border border-iteo-gray-200 px-4 py-3.5 text-2xl font-bold tabular-nums text-iteo-black placeholder:text-iteo-gray-300 focus:border-iteo-yellow focus:outline-none focus:ring-2 focus:ring-iteo-yellow/30 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">
            Kategori
          </label>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {quickCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                disabled={disabled}
                onClick={() => onCategoryChange(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                  category === cat
                    ? 'bg-iteo-black text-white'
                    : 'bg-iteo-gray-100 text-iteo-gray-600 hover:bg-iteo-gray-200'
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="veya kategori yazın..."
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-sm disabled:opacity-50"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="finance-date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">
              Tarih
            </label>
            <input
              id="finance-date"
              type="date"
              value={recordDate}
              onChange={(e) => onRecordDateChange(e.target.value)}
              disabled={disabled}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-sm disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="finance-desc" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">
              Açıklama <span className="font-normal normal-case text-iteo-gray-400">(isteğe bağlı)</span>
            </label>
            <input
              id="finance-desc"
              type="text"
              placeholder="Kısa not..."
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={disabled}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-sm disabled:opacity-50"
            />
          </div>
        </div>

        {pendingReceiptUrl && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <span aria-hidden>✓</span>
            <span className="flex-1">Fiş eklendi — kayıtla birlikte saklanacak</span>
            <button type="button" onClick={onRemoveReceipt} className="text-xs font-semibold underline">
              Kaldır
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={saving || disabled || !amount}
          className="w-full rounded-xl bg-iteo-yellow py-3.5 text-sm font-bold text-iteo-black transition-opacity hover:bg-iteo-yellow/90 disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? 'Kaydediliyor...' : 'Kaydı Oluştur'}
        </button>
      </form>
    </section>
  );
}
