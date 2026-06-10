'use client';

export {
  PageHeader,
  StatCard,
  SectionCard,
  ActionCard,
  StatusBadge,
  EmptyState,
  FilterBar,
  FilterField,
  PrimaryButton,
  ResponsiveTable,
  LoadingBlock,
  ErrorBlock,
  paymentStatusTone,
  appointmentStatusTone,
} from '@/components/ui/DesignSystem';
export type { StatusTone, ResponsiveColumn } from '@/components/ui/DesignSystem';

interface DataTableProps {
  columns: { key: string; label: string }[];
  rows: Array<Record<string, string | number | boolean | null>>;
  emptyMessage?: string;
}

export function DataTable({ columns, rows, emptyMessage = 'Kayıt bulunamadı' }: DataTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-iteo-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b border-iteo-gray-200 bg-iteo-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold text-iteo-black">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-iteo-gray-100 last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-iteo-gray-700">
                  {String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface CrudRow {
  id: string;
  isPublished?: boolean;
  cells: Record<string, string | number | boolean | null>;
}

interface CrudTableProps {
  columns: { key: string; label: string }[];
  rows: CrudRow[];
  emptyMessage?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
  deletingId?: string | null;
}

export function CrudTable({
  columns,
  rows,
  emptyMessage = 'Kayıt bulunamadı',
  onEdit,
  onDelete,
  onTogglePublish,
  deletingId,
}: CrudTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
        {emptyMessage}
      </div>
    );
  }

  const hasActions = onEdit || onDelete || onTogglePublish;

  return (
    <div className="overflow-x-auto rounded-2xl border border-iteo-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b border-iteo-gray-200 bg-iteo-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold text-iteo-black">
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th className="px-4 py-3 text-left font-semibold text-iteo-black">İşlem</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-iteo-gray-100 last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-iteo-gray-700">
                  {String(row.cells[col.key] ?? '—')}
                </td>
              ))}
              {hasActions && (
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row.id)}
                        className="rounded-lg border border-iteo-gray-200 px-2.5 py-1 text-xs font-medium hover:bg-iteo-gray-100"
                      >
                        Düzenle
                      </button>
                    )}
                    {onTogglePublish && row.isPublished !== undefined && (
                      <button
                        type="button"
                        onClick={() => onTogglePublish(row.id, row.isPublished!)}
                        className="rounded-lg border border-iteo-gray-200 px-2.5 py-1 text-xs font-medium hover:bg-iteo-gray-100"
                      >
                        {row.isPublished ? 'Yayından Kaldır' : 'Yayınla'}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        disabled={deletingId === row.id}
                        onClick={() => onDelete(row.id)}
                        className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface EditModalProps {
  title: string;
  open: boolean;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

export function EditModal({ title, open, saving, onClose, onSubmit, children }: EditModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-iteo-black">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-iteo-gray-500 hover:bg-iteo-gray-100"
          >
            Kapat
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-iteo-yellow px-4 py-2.5 font-semibold text-iteo-black disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-sm"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
