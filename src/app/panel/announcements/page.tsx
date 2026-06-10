'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { PRIORITY_LABELS } from '@/components/admin/ContentImageUpload';
import { EmptyState, ErrorBlock, LoadingBlock, SectionCard, StatCard } from '@/components/admin/AdminUi';
import { AnnouncementCard } from '@/components/member/announcements/AnnouncementCard';
import { AnnouncementDetailPanel } from '@/components/member/announcements/AnnouncementDetailPanel';
import type { AnnouncementItem } from '@/components/member/announcements/announcements-shared';
import { formatShortDate, sortAnnouncements } from '@/components/member/announcements/announcements-shared';
import { ModulePageHero } from '@/components/member/ModulePageHero';

const PRIORITY_FILTERS = ['ALL', 'URGENT', 'HIGH', 'NORMAL', 'LOW'] as const;
type PriorityFilter = (typeof PRIORITY_FILTERS)[number];

export default function PanelAnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [selected, setSelected] = useState<AnnouncementItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await api.get<ApiResponse<AnnouncementItem> & { items: AnnouncementItem[] }>(
      '/announcements?limit=30',
    );
    setItems(res.items ?? []);
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [items]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (categoryFilter !== 'ALL') {
      list = list.filter((i) => i.category === categoryFilter);
    }
    if (priorityFilter !== 'ALL') {
      list = list.filter((i) => i.priority === priorityFilter);
    }
    return sortAnnouncements(list);
  }, [items, categoryFilter, priorityFilter]);

  const stats = useMemo(() => {
    const important = items.filter((i) => i.priority === 'URGENT' || i.priority === 'HIGH').length;
    const latest = items
      .map((i) => i.publishedAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];
    return {
      total: items.length,
      important,
      latestLabel: formatShortDate(latest ?? null),
    };
  }, [items]);

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6 pb-10">
      <ModulePageHero
        badge="Resmi Bildirim"
        title="Duyurular"
        description="Oda tarafından yayınlanan güncel duyurular, uyarılar ve önemli bilgilendirmeler."
        decoration={
          <svg
            className="pointer-events-none absolute bottom-4 right-8 h-24 w-36 text-iteo-yellow/10"
            viewBox="0 0 200 120"
            fill="currentColor"
            aria-hidden
          >
            <path d="M24 56 L24 88 L120 112 L120 32 Z" />
            <rect x="120" y="48" width="16" height="48" rx="4" />
            <path d="M32 88 Q20 100 16 112" stroke="currentColor" strokeWidth="8" fill="none" />
          </svg>
        }
      />

      {error && <ErrorBlock message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Toplam duyuru" value={stats.total} hint="Yayınlanan bildirim" />
        <StatCard
          label="Önemli"
          value={stats.important}
          hint="Acil ve yüksek öncelikli"
          tone={stats.important > 0 ? 'warning' : 'default'}
        />
        <StatCard label="Son yayın" value={stats.latestLabel} hint="En güncel duyuru" />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="megaphone"
          title="Henüz duyuru yok"
          description="Oda yeni duyurular yayınladığında burada listelenecek."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-12 xl:gap-8">
          <div className={`space-y-4 xl:col-span-5 ${selected ? 'hidden xl:block' : ''}`}>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_FILTERS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriorityFilter(key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    priorityFilter === key
                      ? key === 'URGENT'
                        ? 'bg-iteo-danger text-white'
                        : 'bg-iteo-black text-iteo-yellow'
                      : 'border border-iteo-gray-200 bg-white text-iteo-gray-600 hover:border-iteo-yellow/50'
                  }`}
                >
                  {key === 'ALL' ? 'Tüm öncelikler' : PRIORITY_LABELS[key]}
                </button>
              ))}
            </div>

            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('ALL')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    categoryFilter === 'ALL'
                      ? 'bg-iteo-yellow text-iteo-black'
                      : 'border border-iteo-gray-200 bg-white text-iteo-gray-600 hover:border-iteo-yellow/50'
                  }`}
                >
                  Tüm kategoriler
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      categoryFilter === cat
                        ? 'bg-iteo-yellow text-iteo-black'
                        : 'border border-iteo-gray-200 bg-white text-iteo-gray-600 hover:border-iteo-yellow/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <SectionCard
              title="Duyuru listesi"
              description={`${filteredItems.length} duyuru · öncelik sırasına göre`}
            >
              {filteredItems.length === 0 ? (
                <EmptyState
                  icon="megaphone"
                  title="Eşleşen duyuru yok"
                  description="Filtreleri değiştirerek tekrar deneyin."
                />
              ) : (
                <ul className="space-y-3">
                  {filteredItems.map((item) => (
                    <li key={item.id}>
                      <AnnouncementCard
                        item={item}
                        active={selected?.id === item.id}
                        onClick={() => setSelected(item)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <div className={`xl:col-span-7 ${!selected ? 'hidden xl:block' : ''}`}>
            <div className="xl:sticky xl:top-24">
              <AnnouncementDetailPanel item={selected} onClose={() => setSelected(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
