'use client';

import { useEffect, useRef } from 'react';
import type { FinancePeriod, FinancePeriodSelection, FinanceTypeFilter } from '@/lib/finance-period';
import {
  formatPeriodHint,
  getAvailableYears,
  periodLabels,
  TR_MONTHS,
  typeFilterLabels,
} from '@/lib/finance-period';

const periods: FinancePeriod[] = ['week', 'month', 'year', 'all'];
const typeFilters: FinanceTypeFilter[] = ['ALL', 'INCOME', 'EXPENSE'];

const TR_MONTHS_SHORT = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
];

interface PeriodTabsProps {
  selection: FinancePeriodSelection;
  onChange: (selection: FinancePeriodSelection) => void;
  embedded?: boolean;
}

export function FinancePeriodTabs({ selection, onChange, embedded = false }: PeriodTabsProps) {
  const years = getAvailableYears();
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  const showYear = selection.period === 'month' || selection.period === 'year';
  const showMonths = selection.period === 'month';
  const minYear = years[years.length - 1];
  const maxYear = years[0];

  useEffect(() => {
    if (!showMonths || !monthScrollRef.current) return;
    const active = monthScrollRef.current.querySelector('[data-active="true"]');
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selection.month, showMonths]);

  function setPeriod(period: FinancePeriod) {
    onChange({ ...selection, period });
  }

  function setYear(year: number) {
    onChange({ ...selection, year });
  }

  function setMonth(month: number) {
    onChange({ ...selection, month });
  }

  function stepYear(delta: number) {
    const next = selection.year + delta;
    if (next < minYear || next > maxYear) return;
    setYear(next);
  }

  return (
    <div
      className={
        embedded
          ? 'space-y-4 pt-4'
          : 'overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-sm'
      }>
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-iteo-gray-100 bg-gradient-to-r from-iteo-gray-50 to-white px-4 py-3 sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-iteo-gray-500">Dönem</p>
            <p className="mt-0.5 text-sm font-bold text-iteo-black">{formatPeriodHint(selection)}</p>
          </div>
          <span className="rounded-full bg-iteo-black px-3 py-1 text-xs font-medium text-iteo-yellow">
            {periodLabels[selection.period]}
          </span>
        </div>
      )}

      <div className={embedded ? 'space-y-4' : 'space-y-4 p-4 sm:p-5'}>
        <div
          role="tablist"
          aria-label="Dönem türü"
          className="grid grid-cols-4 gap-1 rounded-xl bg-iteo-gray-100 p-1">
          {periods.map((p) => {
            const active = selection.period === p;
            return (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-2 py-2.5 text-center text-xs font-semibold transition-all duration-200 sm:text-sm ${
                  active
                    ? 'bg-white text-iteo-black shadow-sm ring-1 ring-black/5'
                    : 'text-iteo-gray-500 hover:text-iteo-black'
                }`}>
                {periodLabels[p]}
              </button>
            );
          })}
        </div>

        {showYear && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-iteo-gray-500">
              {showMonths ? 'Yıl ve ay' : 'Yıl'}
            </p>
            <div className="inline-flex items-center rounded-xl border border-iteo-gray-200 bg-iteo-gray-50 p-0.5">
              <button
                type="button"
                onClick={() => stepYear(-1)}
                disabled={selection.year <= minYear}
                aria-label="Önceki yıl"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-iteo-gray-600 transition-colors hover:bg-white hover:text-iteo-black disabled:cursor-not-allowed disabled:opacity-30">
                ‹
              </button>
              <span className="min-w-[4.5rem] select-none text-center text-sm font-bold tabular-nums text-iteo-black">
                {selection.year}
              </span>
              <button
                type="button"
                onClick={() => stepYear(1)}
                disabled={selection.year >= maxYear}
                aria-label="Sonraki yıl"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-iteo-gray-600 transition-colors hover:bg-white hover:text-iteo-black disabled:cursor-not-allowed disabled:opacity-30">
                ›
              </button>
            </div>
          </div>
        )}

        {showMonths && (
          <div
            ref={monthScrollRef}
            role="tablist"
            aria-label="Ay seçimi"
            className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TR_MONTHS.map((label, index) => {
              const isFuture =
                selection.year === now.getFullYear() && index > now.getMonth();
              const active = selection.month === index;
              return (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-active={active ? 'true' : undefined}
                  disabled={isFuture}
                  title={label}
                  onClick={() => setMonth(index)}
                  className={`flex min-w-[3.25rem] shrink-0 snap-center flex-col items-center rounded-xl px-2 py-2 transition-all duration-200 ${
                    active
                      ? 'bg-iteo-yellow text-iteo-black shadow-md shadow-iteo-yellow/25 ring-2 ring-iteo-yellow/40'
                      : isFuture
                        ? 'cursor-not-allowed bg-iteo-gray-50 text-iteo-gray-300'
                        : 'bg-iteo-gray-50 text-iteo-gray-600 hover:bg-iteo-gray-100 hover:text-iteo-black'
                  }`}>
                  <span className="text-xs font-bold">{TR_MONTHS_SHORT[index]}</span>
                  <span className="mt-0.5 text-[10px] font-medium opacity-60">{index + 1}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface TypeFilterProps {
  value: FinanceTypeFilter;
  onChange: (filter: FinanceTypeFilter) => void;
}

export function FinanceTypeFilter({ value, onChange }: TypeFilterProps) {
  return (
    <div className="inline-flex rounded-full bg-iteo-gray-100 p-1">
      {typeFilters.map((f) => {
        const active = value === f;
        const activeClass =
          f === 'INCOME'
            ? 'bg-green-600 text-white shadow-sm'
            : f === 'EXPENSE'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-iteo-black text-white shadow-sm';

        return (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
              active ? activeClass : 'text-iteo-gray-600 hover:text-iteo-black'
            }`}>
            {typeFilterLabels[f]}
          </button>
        );
      })}
    </div>
  );
}
