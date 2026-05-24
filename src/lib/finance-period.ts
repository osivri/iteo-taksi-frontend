export type FinancePeriod = 'week' | 'month' | 'year' | 'all';
export type FinanceTypeFilter = 'ALL' | 'INCOME' | 'EXPENSE';

export interface FinancePeriodSelection {
  period: FinancePeriod;
  year: number;
  month: number; // 0–11
}

export const TR_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

export function getAvailableYears(count = 6): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => current - i);
}

export function getPeriodRange(selection: FinancePeriodSelection): { from?: string; to?: string } {
  const now = new Date();
  const { period, year, month } = selection;

  if (period === 'all') return {};

  if (period === 'week') {
    const to = now;
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  if (period === 'month') {
    const from = new Date(year, month, 1);
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    const to = isCurrentMonth ? now : new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  const from = new Date(year, 0, 1);
  const isCurrentYear = year === now.getFullYear();
  const to = isCurrentYear ? now : new Date(year, 11, 31, 23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function formatPeriodHint(selection: FinancePeriodSelection): string {
  const { period, year, month } = selection;
  if (period === 'all') return 'Tüm zamanlar';
  if (period === 'week') return 'Son 7 gün';
  if (period === 'month') return `${TR_MONTHS[month]} ${year}`;
  return `${year} yılı`;
}

export const periodLabels: Record<FinancePeriod, string> = {
  week: 'Haftalık',
  month: 'Aylık',
  year: 'Yıllık',
  all: 'Tümü',
};

export const typeFilterLabels: Record<FinanceTypeFilter, string> = {
  ALL: 'Tümü',
  INCOME: 'Gelir',
  EXPENSE: 'Gider',
};

export function buildRangeQuery(range: { from?: string; to?: string }): string {
  const qs = new URLSearchParams();
  if (range.from) qs.set('from', range.from);
  if (range.to) qs.set('to', range.to);
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export function defaultPeriodSelection(): FinancePeriodSelection {
  const now = new Date();
  return { period: 'month', year: now.getFullYear(), month: now.getMonth() };
}
