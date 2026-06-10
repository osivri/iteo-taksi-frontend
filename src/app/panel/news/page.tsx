'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { EmptyState, ErrorBlock, LoadingBlock, SectionCard, StatCard } from '@/components/admin/AdminUi';
import { ModulePageHero } from '@/components/member/ModulePageHero';
import { NewsCard, type NewsListItem } from '@/components/member/news/NewsCard';
import { NewsDetailPanel, type NewsDetail } from '@/components/member/news/NewsDetailPanel';

export default function PanelNewsPage() {
  const [items, setItems] = useState<NewsListItem[]>([]);
  const [selected, setSelected] = useState<NewsDetail | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<ApiResponse<NewsListItem> & { items: NewsListItem[] }>('/news?limit=30');
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
    if (categoryFilter === 'ALL') return items;
    return items.filter((i) => i.category === categoryFilter);
  }, [items, categoryFilter]);

  const stats = useMemo(() => {
    const latest = items
      .map((i) => i.publishedAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];
    return {
      total: items.length,
      categoryCount: categories.length,
      latestLabel: latest
        ? new Date(latest).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—',
    };
  }, [items, categories.length]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<NewsDetail>>(`/news/${id}`);
      setSelected(res.data ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelected(null);
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6 pb-10">
      <ModulePageHero
        badge="Gündem"
        title="Haberler"
        description="Sektörel gelişmeler, oda duyuruları ve taksi dünyasından güncel içerikler."
        decoration={
          <svg
            className="pointer-events-none absolute bottom-4 right-8 h-24 w-32 text-iteo-yellow/10"
            viewBox="0 0 200 120"
            fill="currentColor"
            aria-hidden
          >
            <rect x="36" y="32" width="128" height="72" rx="10" />
            <rect x="52" y="52" width="96" height="8" rx="3" />
            <rect x="52" y="68" width="80" height="8" rx="3" />
            <rect x="52" y="84" width="56" height="8" rx="3" />
          </svg>
        }
      />

      {error && <ErrorBlock message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Toplam haber" value={stats.total} hint="Yayınlanan içerik" />
        <StatCard label="Kategori" value={stats.categoryCount} hint="Farklı konu başlığı" />
        <StatCard label="Son yayın" value={stats.latestLabel} hint="En güncel haber tarihi" />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="news"
          title="Henüz haber yok"
          description="Oda yeni haberler yayınladığında burada listelenecek."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-12 xl:gap-8">
          <div className={`space-y-4 xl:col-span-5 ${selected ? 'hidden xl:block' : ''}`}>
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('ALL')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    categoryFilter === 'ALL'
                      ? 'bg-iteo-black text-iteo-yellow'
                      : 'border border-iteo-gray-200 bg-white text-iteo-gray-600 hover:border-iteo-yellow/50'
                  }`}
                >
                  Tümü
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
              title="Haber listesi"
              description={
                categoryFilter === 'ALL'
                  ? `${filteredItems.length} haber`
                  : `${filteredItems.length} haber · ${categoryFilter}`
              }
            >
              {filteredItems.length === 0 ? (
                <EmptyState
                  icon="news"
                  title="Bu kategoride haber yok"
                  description="Farklı bir kategori seçmeyi deneyin."
                />
              ) : (
                <ul className="space-y-3">
                  {filteredItems.map((item) => (
                    <li key={item.id}>
                      <NewsCard
                        item={item}
                        active={selected?.id === item.id}
                        onClick={() => openDetail(item.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <div className={`xl:col-span-7 ${!selected && !detailLoading ? 'hidden xl:block' : ''}`}>
            <div className="xl:sticky xl:top-24">
              <NewsDetailPanel item={selected} loading={detailLoading} onClose={closeDetail} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
