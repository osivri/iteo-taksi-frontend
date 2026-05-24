'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

interface NewsDetail extends NewsItem {
  content: string;
}

export default function PanelNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [selected, setSelected] = useState<NewsDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<NewsItem> & { items: NewsItem[] }>('/news?limit=30')
      .then((res) => setItems(res.items ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function openDetail(id: string) {
    setDetailLoading(true);
    try {
      const res = await api.get<ApiResponse<NewsDetail>>(`/news/${id}`);
      setSelected(res.data ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDetailLoading(false);
    }
  }

  if (loading) return <LoadingBlock />;
  if (error && !selected) return <ErrorBlock message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Haberler" description="Sektörel gelişmeler ve oda haberleri." />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-iteo-gray-200 bg-white p-10 text-center text-iteo-gray-500">
          Henüz haber yok.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openDetail(item.id)}
                className={`w-full overflow-hidden rounded-2xl border bg-white text-left transition ${
                  selected?.id === item.id
                    ? 'border-iteo-yellow shadow-md'
                    : 'border-iteo-gray-200 hover:border-iteo-yellow/50'
                }`}>
                {item.coverImageUrl && (
                  <div className="relative h-32 w-full bg-iteo-gray-100">
                    <Image src={item.coverImageUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase text-iteo-yellow">{item.category}</p>
                  <p className="mt-1 font-semibold text-iteo-black">{item.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-iteo-gray-500">{item.summary}</p>
                  <p className="mt-2 text-xs text-iteo-gray-400">
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('tr-TR') : '—'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="min-h-[280px] overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-sm">
            {detailLoading ? (
              <p className="p-6 text-iteo-gray-500">Yükleniyor...</p>
            ) : selected ? (
              <>
                {selected.coverImageUrl && (
                  <div className="relative h-48 w-full bg-iteo-gray-100">
                    <Image
                      src={selected.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-6">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-sm font-medium text-iteo-yellow">
                    ← Listeye dön
                  </button>
                  <p className="mt-3 text-xs font-semibold uppercase text-iteo-yellow">{selected.category}</p>
                  <h2 className="mt-2 text-xl font-bold text-iteo-black">{selected.title}</h2>
                  <p className="mt-1 text-xs text-iteo-gray-500">
                    {selected.publishedAt
                      ? new Date(selected.publishedAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : ''}
                  </p>
                  <p className="mt-4 font-medium text-iteo-gray-800">{selected.summary}</p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-iteo-gray-600">
                    {selected.content}
                  </p>
                </div>
              </>
            ) : (
              <p className="p-6 text-iteo-gray-500">Detay görmek için bir haber seçin.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
