'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { EmptyState, ErrorBlock, LoadingBlock, SectionCard, StatCard } from '@/components/admin/AdminUi';
import { OhsChatPanel } from '@/components/member/ohs/OhsChatPanel';
import { OhsContentCard } from '@/components/member/ohs/OhsContentCard';
import { OhsDetailPanel } from '@/components/member/ohs/OhsDetailPanel';
import type { OhsContent, OhsDetail } from '@/components/member/ohs/ohs-shared';
import { typeLabels } from '@/components/member/ohs/ohs-shared';
import { ModulePageHero } from '@/components/member/ModulePageHero';

export default function PanelOhsPage() {
  const [items, setItems] = useState<OhsContent[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OhsDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<ApiResponse<OhsContent> & { items: OhsContent[] }>('/ohs/contents?limit=30');
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
    const faqCount = items.filter((i) => i.type === 'FAQ').length;
    return {
      total: items.length,
      categoryCount: categories.length,
      faqCount,
    };
  }, [items, categories.length]);

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<OhsDetail>>(`/ohs/contents/${id}`);
      setDetail(res.data ?? null);
    } catch (e) {
      setError((e as Error).message);
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedId(null);
    setDetail(null);
  }

  async function askChatbot() {
    if (!question.trim()) return;
    setAsking(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<{ answer: string }>>('/ohs/chat', { message: question });
      setAnswer(res.data?.answer ?? 'Yanıt alınamadı');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAsking(false);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6 pb-10">
      <ModulePageHero
        badge="İş Güvenliği"
        title="İSG Danışman"
        description="İş sağlığı ve güvenliği eğitimleri, sık sorulan sorular ve yapay zeka destekli danışmanlık."
        decoration={
          <svg
            className="pointer-events-none absolute bottom-4 right-8 h-28 w-28 text-iteo-yellow/10"
            viewBox="0 0 200 160"
            fill="currentColor"
            aria-hidden
          >
            <path d="M100 24 L48 48 V96 Q48 132 100 152 Q152 132 152 96 V48 Z" />
            <path d="M100 72 L88 96 H112 Z" fill="currentColor" opacity="0.5" />
          </svg>
        }
      />

      {error && <ErrorBlock message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Eğitim içeriği" value={stats.total} hint="Makale, video ve rehber" />
        <StatCard label="Konu başlığı" value={stats.categoryCount} hint="Farklı İSG kategorisi" />
        <StatCard label="Sık sorulan" value={stats.faqCount} hint="SSS içerikleri" />
      </div>

      <div className="grid gap-6 xl:grid-cols-12 xl:gap-8">
        <div className="xl:col-span-5">
          <div className="xl:sticky xl:top-24">
            <OhsChatPanel
              question={question}
              answer={answer}
              asking={asking}
              onQuestionChange={setQuestion}
              onAsk={askChatbot}
            />
          </div>
        </div>

        <div className="space-y-4 xl:col-span-7">
          {items.length === 0 ? (
            <EmptyState
              icon="shield"
              title="Henüz içerik yok"
              description="Oda İSG eğitimleri yayınlandığında burada görünecek."
            />
          ) : (
            <>
              <div className={`space-y-4 ${selectedId ? 'hidden xl:block' : ''}`}>
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
                  title="Eğitim içerikleri"
                  description={`${filteredItems.length} içerik · ${typeLabels.FAQ}, video ve rehberler`}
                >
                  {filteredItems.length === 0 ? (
                    <EmptyState
                      icon="shield"
                      title="Bu kategoride içerik yok"
                      description="Farklı bir kategori seçmeyi deneyin."
                    />
                  ) : (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {filteredItems.map((item) => (
                        <li key={item.id}>
                          <OhsContentCard
                            item={item}
                            active={selectedId === item.id}
                            onClick={() => openDetail(item.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
              </div>

              <div className={!selectedId && !detailLoading ? 'hidden xl:block' : ''}>
                <OhsDetailPanel detail={detail} loading={detailLoading} onClose={closeDetail} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
