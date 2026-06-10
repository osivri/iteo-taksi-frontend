'use client';

import { useMemo } from 'react';
import { IteoIcon } from '@/components/ui/icons';
import {
  ALL_ISTANBUL_LABEL,
  countByDistrict,
  countByNeighborhood,
  formatLocationLabel,
  sortedDistrictEntries,
  sortedNeighborhoodEntries,
  type MarketplaceLocatable,
} from './marketplace-location';

interface Props<T extends MarketplaceLocatable> {
  items: T[];
  district: string;
  neighborhood: string;
  onDistrictChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onReset: () => void;
  entityLabel: string;
  compact?: boolean;
}

function CountBadge({ count }: { count: number }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
        count > 0 ? 'bg-iteo-black/10 text-iteo-gray-600' : 'bg-iteo-gray-100 text-iteo-gray-400'
      }`}
    >
      {count}
    </span>
  );
}

export function MarketplaceLocationSidebar<T extends MarketplaceLocatable>({
  items,
  district,
  neighborhood,
  onDistrictChange,
  onNeighborhoodChange,
  onReset,
  entityLabel,
  compact = false,
}: Props<T>) {
  const districtCounts = useMemo(() => countByDistrict(items), [items]);
  const neighborhoodCounts = useMemo(
    () => (district ? countByNeighborhood(items, district) : {}),
    [items, district],
  );

  const districtEntries = useMemo(() => sortedDistrictEntries(districtCounts), [districtCounts]);
  const neighborhoodEntries = useMemo(
    () => (district ? sortedNeighborhoodEntries(neighborhoodCounts, district) : []),
    [district, neighborhoodCounts],
  );

  const shellClass = compact
    ? 'overflow-hidden rounded-xl border border-iteo-gray-200 bg-white'
    : 'overflow-hidden rounded-xl border border-iteo-gray-200 bg-white shadow-sm';

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4 lg:sticky lg:top-24'}>
      <div className={shellClass}>
        <div className="border-b border-iteo-gray-100 bg-iteo-gray-50 px-3 py-2.5">
          <p className="text-xs font-bold text-iteo-black">Konum kategorisi</p>
          {!compact ? (
            <p className="mt-0.5 text-xs text-iteo-gray-500">Tüm ilçe ve mahallelerden {entityLabel} filtreleyin</p>
          ) : null}
        </div>

        <div className="border-b border-iteo-gray-100 p-1.5">
          <button
            type="button"
            onClick={onReset}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition ${
              !district ? 'bg-iteo-yellow text-iteo-black' : 'text-iteo-gray-700 hover:bg-iteo-gray-50'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <IteoIcon name="pin" size={14} />
              {ALL_ISTANBUL_LABEL}
            </span>
            <CountBadge count={items.length} />
          </button>
        </div>

        <div className="max-h-56 overflow-y-auto border-b border-iteo-gray-100 p-1.5 lg:max-h-72">
          <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-iteo-gray-400">İlçe</p>
          <ul className="space-y-0.5">
            {districtEntries.map(([name, count]) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => {
                    onDistrictChange(name);
                    onNeighborhoodChange('');
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm font-semibold transition ${
                    district === name && !neighborhood
                      ? 'bg-iteo-yellow text-iteo-black'
                      : district === name
                        ? 'bg-iteo-yellow/20 text-iteo-black'
                        : 'text-iteo-gray-700 hover:bg-iteo-gray-50'
                  }`}
                >
                  <span>{name}</span>
                  <CountBadge count={count} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {district ? (
          <div className="max-h-56 overflow-y-auto p-1.5 lg:max-h-72">
            <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-iteo-gray-400">Mahalle</p>
            <ul className="space-y-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => onNeighborhoodChange('')}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm font-semibold transition ${
                    !neighborhood ? 'bg-iteo-yellow text-iteo-black' : 'text-iteo-gray-700 hover:bg-iteo-gray-50'
                  }`}
                >
                  <span>Tümü</span>
                  <CountBadge count={districtCounts[district] ?? 0} />
                </button>
              </li>
              {neighborhoodEntries.map(([name, count]) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => onNeighborhoodChange(name)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm font-semibold transition ${
                      neighborhood === name
                        ? 'bg-iteo-yellow text-iteo-black'
                        : 'text-iteo-gray-700 hover:bg-iteo-gray-50'
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <CountBadge count={count} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {!compact && (district || neighborhood) ? (
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-iteo-gray-200 py-2 text-sm font-semibold text-iteo-gray-600 hover:bg-iteo-gray-50"
        >
          Filtreyi temizle
        </button>
      ) : null}

      {!compact ? (
        <p className="text-xs text-iteo-gray-500">
          Seçili: <span className="font-semibold text-iteo-black">{formatLocationLabel(district, neighborhood)}</span>
        </p>
      ) : null}
    </div>
  );
}
