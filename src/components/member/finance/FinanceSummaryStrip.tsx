'use client';

import { formatPeriodHint, type FinancePeriodSelection } from '@/lib/finance-period';

interface Props {
  summary: {
    totalIncome: number;
    totalExpense: number;
    net: number;
    currency: string;
  };
  periodSelection: FinancePeriodSelection;
  plateLabel?: string;
}

export function FinanceSummaryStrip({ summary, periodSelection, plateLabel }: Props) {
  const periodHint = formatPeriodHint(periodSelection);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-green-200/60 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Toplam gelir</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-green-800">
          {summary.totalIncome.toLocaleString('tr-TR')}{' '}
          <span className="text-base font-semibold">{summary.currency}</span>
        </p>
      </div>
      <div className="rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Toplam gider</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-red-800">
          {summary.totalExpense.toLocaleString('tr-TR')}{' '}
          <span className="text-base font-semibold">{summary.currency}</span>
        </p>
      </div>
      <div className="rounded-2xl border border-iteo-yellow/40 bg-gradient-to-br from-iteo-yellow/15 to-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-iteo-gray-600">Net bakiye</p>
        <p
          className={`mt-1 text-2xl font-bold tabular-nums ${
            summary.net >= 0 ? 'text-iteo-black' : 'text-red-700'
          }`}>
          {summary.net >= 0 ? '+' : ''}
          {summary.net.toLocaleString('tr-TR')}{' '}
          <span className="text-base font-semibold">{summary.currency}</span>
        </p>
        <p className="mt-1 truncate text-[11px] text-iteo-gray-500">
          {plateLabel ? `${plateLabel} · ` : ''}
          {periodHint}
        </p>
      </div>
    </div>
  );
}
