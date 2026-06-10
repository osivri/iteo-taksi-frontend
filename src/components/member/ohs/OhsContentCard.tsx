'use client';

import { IteoIcon } from '@/components/ui/icons';
import { StatusBadge } from '@/components/ui/DesignSystem';
import type { OhsContent } from './ohs-shared';
import { typeLabels, typeTone } from './ohs-shared';

interface Props {
  item: OhsContent;
  active: boolean;
  onClick: () => void;
}

const typeIcon: Record<string, 'shield' | 'help' | 'news' | 'clock'> = {
  VIDEO: 'clock',
  ARTICLE: 'news',
  GUIDE: 'shield',
  FAQ: 'help',
};

export function OhsContentCard({ item, active, onClick }: Props) {
  const icon = typeIcon[item.type] ?? 'shield';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition duration-200 ${
        active
          ? 'border-iteo-yellow ring-2 ring-iteo-yellow/25'
          : 'border-iteo-gray-200 hover:border-iteo-yellow/50 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            active ? 'bg-iteo-yellow text-iteo-black' : 'bg-iteo-gray-100 text-iteo-gray-600 group-hover:bg-iteo-yellow/20'
          }`}
        >
          <IteoIcon name={icon} size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-iteo-yellow">{item.category}</p>
          <p className="mt-1 font-bold text-iteo-black group-hover:text-iteo-yellow-dark">{item.title}</p>
          <div className="mt-2">
            <StatusBadge label={typeLabels[item.type] ?? item.type} tone={typeTone(item.type)} />
          </div>
        </div>
      </div>
    </button>
  );
}
