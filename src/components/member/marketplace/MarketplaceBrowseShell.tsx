'use client';

import { MarketplaceLocationSidebar } from './MarketplaceLocationSidebar';
import type { MarketplaceLocatable } from './marketplace-location';

interface Props<T extends MarketplaceLocatable> {
  items: T[];
  district: string;
  neighborhood: string;
  onDistrictChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onResetLocation: () => void;
  entityLabel: string;
  filterBar: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function MarketplaceBrowseShell<T extends MarketplaceLocatable>({
  items,
  district,
  neighborhood,
  onDistrictChange,
  onNeighborhoodChange,
  onResetLocation,
  entityLabel,
  filterBar,
  children,
  footer,
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-sm">
      {filterBar}

      <div className="grid lg:grid-cols-12">
        <aside className="border-b border-iteo-gray-100 lg:col-span-3 lg:border-b-0 lg:border-r">
          <div className="p-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <MarketplaceLocationSidebar
              items={items}
              district={district}
              neighborhood={neighborhood}
              onDistrictChange={onDistrictChange}
              onNeighborhoodChange={onNeighborhoodChange}
              onReset={onResetLocation}
              entityLabel={entityLabel}
              compact
            />
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="min-h-[280px] p-4 sm:p-5">{children}</div>
          {footer ? <div className="border-t border-iteo-gray-100 px-4 py-3 sm:px-5">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
