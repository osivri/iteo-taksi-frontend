'use client';

import { EmptyState } from '@/components/admin/AdminUi';
import { IteoIcon } from '@/components/ui/icons';
import { DistrictNeighborhoodFields } from './DistrictNeighborhoodFields';
import { ListingCard } from './ListingCard';
import type { Listing, ListingTypeFilter, SortOption } from './listings-shared';
import { inputClass, labelClass, typeLabels } from './listings-shared';

interface Props {
  items: Listing[];
  loading: boolean;
  typeFilter: ListingTypeFilter;
  district: string;
  neighborhood: string;
  search: string;
  minPrice: string;
  maxPrice: string;
  sort: SortOption;
  viewMode: 'grid' | 'list';
  onTypeFilterChange: (v: ListingTypeFilter) => void;
  onDistrictChange: (v: string) => void;
  onNeighborhoodChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onSortChange: (v: SortOption) => void;
  onViewModeChange: (v: 'grid' | 'list') => void;
  onApplyServerFilters: () => void;
  onClearFilters: () => void;
  onSelectListing: (listing: Listing) => void;
}

const typeOptions: { value: ListingTypeFilter; label: string; icon: 'taxi' | 'pin' | 'grid' }[] = [
  { value: 'ALL', label: 'Tüm İlanlar', icon: 'grid' },
  { value: 'VEHICLE_RENTAL', label: 'Araç Kiralama', icon: 'taxi' },
  { value: 'PLATE_SALE', label: 'Plaka Satış', icon: 'pin' },
];

export function ListingsBrowsePanel({
  items,
  loading,
  typeFilter,
  district,
  neighborhood,
  search,
  minPrice,
  maxPrice,
  sort,
  viewMode,
  onTypeFilterChange,
  onDistrictChange,
  onNeighborhoodChange,
  onSearchChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onViewModeChange,
  onApplyServerFilters,
  onClearFilters,
  onSelectListing,
}: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <div className="lg:sticky lg:top-24 space-y-4">
          <div className="overflow-hidden rounded-xl border border-iteo-gray-200 bg-white shadow-sm">
            <div className="border-b border-iteo-gray-100 bg-iteo-gray-50 px-4 py-3">
              <p className="text-sm font-bold text-iteo-black">Kategori</p>
            </div>
            <ul className="p-2">
              {typeOptions.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => onTypeFilterChange(opt.value)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                      typeFilter === opt.value
                        ? 'bg-iteo-yellow text-iteo-black'
                        : 'text-iteo-gray-700 hover:bg-iteo-gray-50'
                    }`}
                  >
                    <IteoIcon name={opt.icon} size={18} />
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-iteo-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-bold text-iteo-black">Detaylı Filtre</p>
            <div className="space-y-3">
              <DistrictNeighborhoodFields
                district={district}
                neighborhood={neighborhood}
                onDistrictChange={onDistrictChange}
                onNeighborhoodChange={onNeighborhoodChange}
                layout="stack"
              />
              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className={labelClass}>Min ₺</span>
                  <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => onMinPriceChange(e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1">
                  <span className={labelClass}>Max ₺</span>
                  <input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => onMaxPriceChange(e.target.value)}
                    placeholder="∞"
                    className={inputClass}
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={onApplyServerFilters}
                className="w-full rounded-lg bg-iteo-black py-2.5 text-sm font-bold text-iteo-yellow"
              >
                Filtrele
              </button>
              <button
                type="button"
                onClick={onClearFilters}
                className="w-full rounded-lg border border-iteo-gray-200 py-2 text-sm font-semibold text-iteo-gray-600 hover:bg-iteo-gray-50"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:col-span-9 space-y-4">
        <div className="rounded-xl border border-iteo-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <IteoIcon
                name="pin"
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-iteo-gray-400"
              />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="İlan başlığı, açıklama veya konum ara..."
                className={`${inputClass} pl-10`}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className={`${inputClass} sm:w-44`}
            >
              <option value="newest">En yeni ilan</option>
              <option value="price_asc">Fiyat (artan)</option>
              <option value="price_desc">Fiyat (azalan)</option>
            </select>
            <div className="flex rounded-lg border border-iteo-gray-200 p-1">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`rounded-md px-3 py-1.5 text-xs font-bold ${viewMode === 'grid' ? 'bg-iteo-yellow text-iteo-black' : 'text-iteo-gray-500'}`}
              >
                Izgara
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`rounded-md px-3 py-1.5 text-xs font-bold ${viewMode === 'list' ? 'bg-iteo-yellow text-iteo-black' : 'text-iteo-gray-500'}`}
              >
                Liste
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-iteo-gray-500">
            <span className="font-bold text-iteo-black">{items.length}</span> ilan bulundu
            {typeFilter !== 'ALL' && (
              <span> · {typeLabels[typeFilter]}</span>
            )}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-iteo-gray-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="pin"
            title="İlan bulunamadı"
            description="Filtreleri değiştirin veya daha sonra tekrar kontrol edin."
          />
        ) : viewMode === 'grid' ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <ListingCard listing={item} onClick={() => onSelectListing(item)} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <ListingCard listing={item} variant="list" onClick={() => onSelectListing(item)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
