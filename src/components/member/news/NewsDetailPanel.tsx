'use client';

import Image from 'next/image';
import { IteoIcon } from '@/components/ui/icons';
import { StatusBadge } from '@/components/ui/DesignSystem';
import type { NewsListItem } from './NewsCard';

export interface NewsDetail extends NewsListItem {
  content: string;
}

interface Props {
  item: NewsDetail | null;
  loading: boolean;
  onClose: () => void;
}

function formatLongDate(value: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function NewsDetailPanel({ item, loading, onClose }: Props) {
  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-iteo-gray-200 bg-white shadow-md">
        <div className="flex items-center gap-3 text-sm text-iteo-gray-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-iteo-yellow border-t-transparent" />
          Haber yükleniyor...
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-iteo-gray-200 bg-white px-6 py-12 text-center shadow-sm">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-iteo-gray-100 text-iteo-gray-400">
          <IteoIcon name="news" size={28} />
        </span>
        <p className="font-semibold text-iteo-black">Bir haber seçin</p>
        <p className="mt-2 max-w-xs text-sm text-iteo-gray-500">
          Soldaki listeden okumak istediğiniz haberi seçerek detayını görüntüleyin.
        </p>
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-md">
      {item.coverImageUrl ? (
        <div className="relative h-52 w-full bg-iteo-gray-100 sm:h-56">
          <Image src={item.coverImageUrl} alt="" fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-xl bg-black/50 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur hover:bg-black/70">
            <IteoIcon name="home" size={14} />
            Listeye dön
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <StatusBadge label={item.category} tone="warning" />
            <h2 className="mt-2 text-xl font-black leading-tight text-white sm:text-2xl">{item.title}</h2>
            {item.publishedAt && (
              <p className="mt-2 text-sm text-white/75">{formatLongDate(item.publishedAt)}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative bg-gradient-to-br from-iteo-black via-[#151515] to-[#262626] px-5 py-6 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-iteo-yellow hover:underline">
            ← Listeye dön
          </button>
          <StatusBadge label={item.category} tone="warning" />
          <h2 className="mt-3 text-xl font-black leading-tight text-white sm:text-2xl">{item.title}</h2>
          {item.publishedAt && (
            <p className="mt-2 text-sm text-white/65">{formatLongDate(item.publishedAt)}</p>
          )}
        </div>
      )}

      <div className="space-y-4 p-5 sm:p-6">
        {item.summary && (
          <p className="rounded-xl border border-iteo-yellow/30 bg-iteo-yellow/10 px-4 py-3 text-sm font-medium leading-relaxed text-iteo-black">
            {item.summary}
          </p>
        )}
        <div className="prose prose-sm max-w-none text-sm leading-relaxed text-iteo-gray-700">
          <p className="whitespace-pre-wrap">{item.content}</p>
        </div>
      </div>
    </article>
  );
}
