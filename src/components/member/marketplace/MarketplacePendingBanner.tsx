'use client';

interface PendingItem {
  id: string;
  title: string;
  subtitle: string;
}

interface Props {
  title: string;
  items: PendingItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  actionId: string | null;
  approveLabel?: string;
  rejectLabel?: string;
}

export function MarketplacePendingBanner({
  title,
  items,
  onApprove,
  onReject,
  actionId,
  approveLabel = 'Onayla',
  rejectLabel = 'Reddet',
}: Props) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-iteo-yellow/40 bg-gradient-to-r from-iteo-yellow/15 to-white p-4">
      <p className="text-sm font-black text-iteo-black">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-iteo-gray-200/80 bg-white px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate font-bold text-iteo-black">{item.title}</p>
              <p className="text-xs text-iteo-gray-500">{item.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onApprove(item.id)}
                disabled={actionId === item.id}
                className="rounded-lg bg-iteo-success px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
              >
                {approveLabel}
              </button>
              <button
                type="button"
                onClick={() => onReject(item.id)}
                disabled={actionId === item.id}
                className="rounded-lg border border-iteo-danger/30 px-3 py-1.5 text-xs font-bold text-iteo-danger disabled:opacity-60"
              >
                {rejectLabel}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
