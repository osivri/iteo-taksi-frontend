'use client';

import Image from 'next/image';
import { IteoIcon } from '@/components/ui/icons';
import { StatusBadge } from '@/components/ui/DesignSystem';
import type { AnnouncementItem } from './announcements-shared';
import {
  contentPreview,
  formatShortDate,
  priorityLabel,
  priorityTone,
} from './announcements-shared';

interface Props {
  item: AnnouncementItem;
  active: boolean;
  onClick: () => void;
}

export function AnnouncementCard({ item, active, onClick }: Props) {
  const urgent = item.priority === 'URGENT';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition duration-200 ${
        urgent ? 'border-iteo-danger/30' : ''
      } ${
        active
          ? 'border-iteo-yellow ring-2 ring-iteo-yellow/25'
          : 'border-iteo-gray-200 hover:border-iteo-yellow/50 hover:shadow-md'
      }`}
    >
      {item.coverImageUrl ? (
        <div className="relative h-36 w-full bg-iteo-gray-100">
          <Image src={item.coverImageUrl} alt="" fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-iteo-yellow px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-iteo-black">
              {item.category}
            </span>
            <StatusBadge label={priorityLabel(item.priority)} tone={priorityTone(item.priority)} />
          </div>
        </div>
      ) : (
        <div
          className={`relative flex h-28 items-center justify-center ${
            urgent
              ? 'bg-gradient-to-br from-iteo-danger-light via-iteo-yellow/10 to-white'
              : 'bg-gradient-to-br from-iteo-yellow/20 via-iteo-gray-50 to-white'
          }`}
        >
          <IteoIcon name="megaphone" size={40} className={urgent ? 'text-iteo-danger/40' : 'text-iteo-yellow/40'} />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-iteo-black px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-iteo-yellow">
              {item.category}
            </span>
            <StatusBadge label={priorityLabel(item.priority)} tone={priorityTone(item.priority)} />
          </div>
        </div>
      )}

      <div className="p-4">
        <p className="font-bold text-iteo-black group-hover:text-iteo-yellow-dark">{item.title}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-iteo-gray-500">
          {contentPreview(item.content)}
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-iteo-gray-400">
          <IteoIcon name="clock" size={14} />
          {formatShortDate(item.publishedAt)}
        </p>
      </div>
    </button>
  );
}
