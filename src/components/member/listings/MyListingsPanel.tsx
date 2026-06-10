'use client';

import { EmptyState } from '@/components/admin/AdminUi';
import { StatusBadge } from '@/components/ui/DesignSystem';
import { ListingCard } from './ListingCard';
import type { Listing } from './listings-shared';
import { statusLabels, statusTone } from './listings-shared';

interface Props {
  items: Listing[];
  loading: boolean;
  onSelect: (listing: Listing) => void;
}

export function MyListingsPanel({ items, loading, onSelect }: Props) {
  const pending = items.filter((i) => i.status === 'PENDING').length;
  const approved = items.filter((i) => i.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-iteo-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-iteo-gray-500">Toplam</p>
          <p className="mt-1 text-2xl font-black text-iteo-black">{items.length}</p>
        </div>
        <div className="rounded-xl border border-iteo-warning/30 bg-iteo-warning-light p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-iteo-warning">Onay bekleyen</p>
          <p className="mt-1 text-2xl font-black text-iteo-black">{pending}</p>
        </div>
        <div className="rounded-xl border border-iteo-success/30 bg-iteo-success-light p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-iteo-success">Yayında</p>
          <p className="mt-1 text-2xl font-black text-iteo-black">{approved}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-iteo-gray-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="pin"
          title="Henüz ilanınız yok"
          description="İlan Ver sekmesinden ilk ilanınızı oluşturun."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="relative">
              <div className="absolute left-3 top-3 z-10">
                <StatusBadge label={statusLabels[item.status] ?? item.status} tone={statusTone(item.status)} />
              </div>
              <ListingCard listing={item} onClick={() => onSelect(item)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
