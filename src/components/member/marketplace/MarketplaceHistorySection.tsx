'use client';

import { StatusBadge } from '@/components/ui/DesignSystem';
import type { PlateRequest } from '@/components/member/vehicles/vehicles-shared';
import { requestStatusLabels, requestStatusTone } from '@/components/member/vehicles/vehicles-shared';

interface Props {
  requests: PlateRequest[];
}

export function MarketplaceHistorySection({ requests }: Props) {
  if (requests.length === 0) return null;

  return (
    <details className="group rounded-2xl border border-iteo-gray-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-iteo-black marker:content-none sm:px-5">
        <span>Eşleştirme geçmişi ({requests.length})</span>
        <span className="text-xs font-semibold text-iteo-gray-500 group-open:hidden">Göster</span>
        <span className="hidden text-xs font-semibold text-iteo-gray-500 group-open:inline">Gizle</span>
      </summary>
      <ul className="divide-y divide-iteo-gray-100 border-t border-iteo-gray-100 px-4 sm:px-5">
        {requests.slice(0, 10).map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <p className="font-semibold text-iteo-black">{r.plateNumber}</p>
              <p className="text-xs text-iteo-gray-500">
                {(r.initiatedBy ?? 'DRIVER') === 'OWNER' ? 'Davet' : 'Başvuru'} ·{' '}
                {new Date(r.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <StatusBadge label={requestStatusLabels[r.status] ?? r.status} tone={requestStatusTone(r.status)} />
          </li>
        ))}
      </ul>
    </details>
  );
}
