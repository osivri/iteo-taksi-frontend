'use client';

import { IteoIcon } from '@/components/ui/icons';
import { StatusBadge } from '@/components/ui/DesignSystem';
import type { OhsDetail } from './ohs-shared';
import { typeLabels, typeTone } from './ohs-shared';

interface Props {
  detail: OhsDetail | null;
  loading: boolean;
  onClose: () => void;
}

export function OhsDetailPanel({ detail, loading, onClose }: Props) {
  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-iteo-gray-200 bg-white shadow-md">
        <div className="flex items-center gap-3 text-sm text-iteo-gray-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-iteo-yellow border-t-transparent" />
          İçerik yükleniyor...
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-iteo-gray-200 bg-white px-6 py-12 text-center shadow-sm">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-iteo-gray-100 text-iteo-gray-400">
          <IteoIcon name="shield" size={28} />
        </span>
        <p className="font-semibold text-iteo-black">Bir içerik seçin</p>
        <p className="mt-2 max-w-xs text-sm text-iteo-gray-500">
          Eğitim kartlarından birine tıklayarak detaylı bilgiye ulaşın.
        </p>
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-md">
      <div className="bg-gradient-to-br from-iteo-black via-[#151515] to-[#262626] px-5 py-6 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-iteo-yellow hover:underline"
        >
          ← Listeye dön
        </button>
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={detail.category} tone="warning" />
          <StatusBadge label={typeLabels[detail.type] ?? detail.type} tone={typeTone(detail.type)} />
        </div>
        <h2 className="mt-3 text-xl font-black leading-tight text-white sm:text-2xl">{detail.title}</h2>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {detail.description && (
          <p className="rounded-xl border border-iteo-yellow/30 bg-iteo-yellow/10 px-4 py-3 text-sm font-medium leading-relaxed text-iteo-black">
            {detail.description}
          </p>
        )}
        {detail.body && (
          <div className="whitespace-pre-wrap rounded-xl border border-iteo-gray-100 bg-iteo-gray-50 p-4 text-sm leading-relaxed text-iteo-gray-700">
            {detail.body}
          </div>
        )}
        {detail.videoUrl && (
          <a
            href={detail.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-iteo-black px-4 py-2.5 text-sm font-semibold text-iteo-yellow transition hover:bg-iteo-black-soft"
          >
            <IteoIcon name="clock" size={16} />
            Videoyu Aç
          </a>
        )}
        {!detail.description && !detail.body && !detail.videoUrl && (
          <p className="text-sm text-iteo-gray-500">Detay içerik bulunmuyor.</p>
        )}
      </div>
    </article>
  );
}
