'use client';

import Image from 'next/image';
import { IteoIcon } from '@/components/ui/icons';
import { StatusBadge } from '@/components/ui/DesignSystem';
import type { AnnouncementItem } from './announcements-shared';
import { formatLongDate, priorityLabel, priorityTone } from './announcements-shared';

interface Props {
  item: AnnouncementItem | null;
  onClose: () => void;
}

export function AnnouncementDetailPanel({ item, onClose }: Props) {
  if (!item) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-iteo-gray-200 bg-white px-6 py-12 text-center shadow-sm">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-iteo-gray-100 text-iteo-gray-400">
          <IteoIcon name="megaphone" size={28} />
        </span>
        <p className="font-semibold text-iteo-black">Bir duyuru seçin</p>
        <p className="mt-2 max-w-xs text-sm text-iteo-gray-500">
          Soldaki listeden okumak istediğiniz duyuruyu seçerek detayını görüntüleyin.
        </p>
      </div>
    );
  }

  const urgent = item.priority === 'URGENT';

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-md ${
        urgent ? 'border-iteo-danger/30' : 'border-iteo-gray-200'
      }`}
    >
      {item.coverImageUrl ? (
        <div className="relative h-52 w-full bg-iteo-gray-100 sm:h-56">
          <Image src={item.coverImageUrl} alt="" fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-xl bg-black/50 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur hover:bg-black/70"
          >
            ← Listeye dön
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={item.category} tone="warning" />
              <StatusBadge label={priorityLabel(item.priority)} tone={priorityTone(item.priority)} />
            </div>
            <h2 className="mt-2 text-xl font-black leading-tight text-white sm:text-2xl">{item.title}</h2>
            {item.publishedAt && (
              <p className="mt-2 text-sm text-white/75">{formatLongDate(item.publishedAt)}</p>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`relative px-5 py-6 sm:px-6 ${
            urgent
              ? 'bg-gradient-to-br from-iteo-danger via-[#8b1a12] to-[#262626]'
              : 'bg-gradient-to-br from-iteo-black via-[#151515] to-[#262626]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-iteo-yellow hover:underline"
          >
            ← Listeye dön
          </button>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={item.category} tone="warning" />
            <StatusBadge label={priorityLabel(item.priority)} tone={priorityTone(item.priority)} />
          </div>
          <h2 className="mt-3 text-xl font-black leading-tight text-white sm:text-2xl">{item.title}</h2>
          {item.publishedAt && (
            <p className="mt-2 text-sm text-white/65">{formatLongDate(item.publishedAt)}</p>
          )}
        </div>
      )}

      <div className="p-5 sm:p-6">
        {urgent && (
          <div className="mb-4 rounded-xl border border-iteo-danger/30 bg-iteo-danger-light px-4 py-3 text-sm font-semibold text-iteo-danger">
            Acil duyuru — lütfen içeriği dikkatle okuyun.
          </div>
        )}
        <div className="prose prose-sm max-w-none text-sm leading-relaxed text-iteo-gray-700">
          <p className="whitespace-pre-wrap">{item.content}</p>
        </div>
      </div>
    </article>
  );
}
