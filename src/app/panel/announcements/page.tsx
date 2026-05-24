'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { PRIORITY_LABELS } from '@/components/admin/ContentImageUpload';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

const priorityStyles: Record<string, string> = {
  URGENT: 'bg-red-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  NORMAL: 'bg-iteo-yellow text-iteo-black',
  LOW: 'bg-iteo-gray-200 text-iteo-gray-700',
};

export default function PanelAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Announcement | null>(null);

  useEffect(() => {
    api
      .get<ApiResponse<Announcement> & { items: Announcement[] }>('/announcements?limit=30')
      .then((res) => setItems(res.items ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Duyurular" description="Oda tarafından yayınlanan güncel duyurular." />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-iteo-gray-200 bg-white p-10 text-center text-iteo-gray-500">
          Henüz duyuru yok.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className={`w-full overflow-hidden rounded-2xl border bg-white text-left transition ${
                  selected?.id === item.id
                    ? 'border-iteo-yellow shadow-md'
                    : 'border-iteo-gray-200 hover:border-iteo-yellow/50'
                }`}>
                {item.coverImageUrl && (
                  <div className="relative h-32 w-full bg-iteo-gray-100">
                    <Image
                      src={item.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase text-iteo-yellow">{item.category}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        priorityStyles[item.priority] ?? priorityStyles.NORMAL
                      }`}>
                      {PRIORITY_LABELS[item.priority] ?? item.priority}
                    </span>
                  </div>
                  <p className="mt-1 font-semibold text-iteo-black">{item.title}</p>
                  <p className="mt-1 text-xs text-iteo-gray-500">
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('tr-TR') : '—'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="min-h-[280px] overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-sm">
            {selected ? (
              <>
                {selected.coverImageUrl && (
                  <div className="relative h-44 w-full bg-iteo-gray-100">
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
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase text-iteo-yellow">{selected.category}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        priorityStyles[selected.priority] ?? priorityStyles.NORMAL
                      }`}>
                      {PRIORITY_LABELS[selected.priority] ?? selected.priority}
                    </span>
                  </div>
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
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-iteo-gray-700">
                    {selected.content}
                  </p>
                </div>
              </>
            ) : (
              <p className="p-6 text-iteo-gray-500">Detay görmek için bir duyuru seçin.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
