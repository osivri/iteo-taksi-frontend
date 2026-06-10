'use client';

interface FinanceBarChartProps {
  income: number;
  expense: number;
  currency?: string;
}

export function FinanceBarChart({ income, expense, currency = '₺' }: FinanceBarChartProps) {
  const max = Math.max(income, expense, 1);

  return (
    <div className="space-y-4 rounded-2xl border border-iteo-gray-200 bg-white p-5 shadow-md">
      <p className="text-sm font-bold text-iteo-black">Gelir / Gider dağılımı</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-green-700">Gelir</span>
          <span className="text-iteo-gray-600">
            {income.toLocaleString('tr-TR')} {currency}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-iteo-gray-100">
          <div
            className="h-full rounded-full bg-green-600 transition-all"
            style={{ width: `${(income / max) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-red-700">Gider</span>
          <span className="text-iteo-gray-600">
            {expense.toLocaleString('tr-TR')} {currency}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-iteo-gray-100">
          <div
            className="h-full rounded-full bg-red-600 transition-all"
            style={{ width: `${(expense / max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface TrendPoint {
  date: string;
  income: number;
  expense: number;
  net: number;
}

interface FinanceTrendChartProps {
  points: TrendPoint[];
  currency?: string;
}

export function FinanceTrendChart({ points, currency = '₺' }: FinanceTrendChartProps) {
  if (points.length === 0) return null;

  const visible = points.slice(-14);
  const maxVal = Math.max(...visible.flatMap((p) => [p.income, p.expense, Math.abs(p.net)]), 1);
  const chartHeight = 80;

  return (
    <div className="rounded-2xl border border-iteo-gray-200 bg-white p-5 shadow-md">
      <p className="mb-3 text-sm font-bold text-iteo-black">Günlük trend</p>
      <div className="flex items-end gap-1" style={{ height: chartHeight }}>
        {visible.map((point) => {
          const netHeight = (Math.abs(point.net) / maxVal) * chartHeight;
          const isPositive = point.net >= 0;
          return (
            <div key={point.date} className="flex flex-1 flex-col items-center justify-end h-full">
              <div
                className={`w-[70%] min-h-1 rounded-sm ${isPositive ? 'bg-green-600' : 'bg-red-600'}`}
                style={{ height: Math.max(netHeight, 4) }}
                title={`${point.date}: ${point.net.toLocaleString('tr-TR')} ${currency}`}
              />
              <span className="mt-1 text-[10px] text-iteo-gray-400">{point.date.slice(5)}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-iteo-gray-500">
        Net hareket ({currency}) — son {visible.length} gün
      </p>
    </div>
  );
}
