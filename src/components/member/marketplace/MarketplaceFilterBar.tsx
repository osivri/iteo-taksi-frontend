'use client';

import { IteoIcon } from '@/components/ui/icons';
import { formatLocationLabel } from './marketplace-location';
import { inputClass } from './marketplace-shared';

interface StatPill {
  label: string;
  value: number;
  highlight?: boolean;
}

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  district: string;
  neighborhood: string;
  onResetLocation: () => void;
  resultCount: number;
  resultLabel: string;
  stats?: StatPill[];
  children?: React.ReactNode;
}

export function MarketplaceFilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  district,
  neighborhood,
  onResetLocation,
  resultCount,
  resultLabel,
  stats = [],
  children,
}: Props) {
  const hasLocationFilter = Boolean(district || neighborhood);

  return (
    <div className="space-y-3 border-b border-iteo-gray-100 bg-iteo-gray-50/80 px-4 py-4 sm:px-5">
      {stats.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <span
              key={s.label}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                s.highlight
                  ? 'border-iteo-yellow bg-iteo-yellow/20 text-iteo-black'
                  : 'border-iteo-gray-200 bg-white text-iteo-gray-700'
              }`}
            >
              <span className="text-sm font-black">{s.value}</span>
              {s.label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={onResetLocation}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold transition ${
              !hasLocationFilter ? 'bg-iteo-yellow text-iteo-black' : 'text-iteo-gray-600 hover:bg-white'
            }`}
          >
            <IteoIcon name="pin" size={14} />
            {formatLocationLabel(district, neighborhood)}
          </button>
          {hasLocationFilter ? (
            <button
              type="button"
              onClick={onResetLocation}
              className="text-xs font-semibold text-iteo-gray-500 underline-offset-2 hover:text-iteo-black hover:underline"
            >
              Temizle
            </button>
          ) : null}
          <span className="hidden text-iteo-gray-300 sm:inline">|</span>
          <span className="text-xs font-semibold text-iteo-gray-500">
            {resultCount} {resultLabel}
          </span>
        </div>

        {children ? <div className="w-full shrink-0 sm:w-auto sm:min-w-[240px]">{children}</div> : null}
      </div>

      <div className="min-w-0">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={inputClass}
        />
      </div>
    </div>
  );
}
