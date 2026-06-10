'use client';

import Image from 'next/image';
import { IteoIcon } from '@/components/ui/icons';

export interface NewsListItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

interface Props {
  item: NewsListItem;
  active: boolean;
  onClick: () => void;
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function NewsCard({ item, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition duration-200 ${
        active
          ? 'border-iteo-yellow ring-2 ring-iteo-yellow/25'
          : 'border-iteo-gray-200 hover:border-iteo-yellow/50 hover:shadow-md'
      }`}
    >
      {item.coverImageUrl ? (
        <div className="relative h-36 w-full bg-iteo-gray-100">
          <Image src={item.coverImageUrl} alt="" fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-3 left-3 rounded-full bg-iteo-yellow px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-iteo-black">
            {item.category}
          </span>
        </div>
      ) : (
        <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-iteo-yellow/20 via-iteo-gray-50 to-white">
          <IteoIcon name="news" size={40} className="text-iteo-yellow/40" />
          <span className="absolute bottom-3 left-3 rounded-full bg-iteo-black px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-iteo-yellow">
            {item.category}
          </span>
        </div>
      )}

      <div className="p-4">
        <p className="font-bold text-iteo-black group-hover:text-iteo-yellow-dark">{item.title}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-iteo-gray-500">{item.summary}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-iteo-gray-400">
          <IteoIcon name="clock" size={14} />
          {formatDate(item.publishedAt)}
        </p>
      </div>
    </button>
  );
}
