'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { IteoIcon, type IconName } from '@/components/ui/icons';

/* ── Status ── */

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const statusStyles: Record<StatusTone, string> = {
  neutral: 'bg-iteo-gray-100 text-iteo-gray-700',
  success: 'bg-iteo-success-light text-iteo-success',
  warning: 'bg-iteo-warning-light text-iteo-warning',
  danger: 'bg-iteo-danger-light text-iteo-danger',
  info: 'bg-iteo-info-light text-iteo-info',
};

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: StatusTone }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[tone]}`}>
      {label}
    </span>
  );
}

export function paymentStatusTone(status: string): StatusTone {
  if (status === 'SUCCESS' || status === 'PAID') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'FAILED' || status === 'OVERDUE') return 'danger';
  return 'neutral';
}

export function appointmentStatusTone(status: string): StatusTone {
  if (status === 'CONFIRMED' || status === 'COMPLETED') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'CANCELLED' || status === 'REJECTED') return 'danger';
  return 'neutral';
}

/* ── Layout blocks ── */

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-iteo-black">{title}</h1>
        {description && <p className="mt-1 text-sm text-iteo-gray-500">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'warning' | 'success' | 'danger';
  href?: string;
}) {
  const toneBorder =
    tone === 'warning'
      ? 'border-iteo-warning/30'
      : tone === 'success'
        ? 'border-iteo-success/30'
        : tone === 'danger'
          ? 'border-iteo-danger/30'
          : 'border-iteo-gray-200';

  const inner = (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${toneBorder}`}>
      <p className="text-sm font-medium text-iteo-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-iteo-black">{value}</p>
      {hint && <p className="mt-1 text-xs text-iteo-gray-500">{hint}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-iteo-gray-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-iteo-gray-100 px-5 py-4">
          <div>
            {title && <h2 className="font-semibold text-iteo-black">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-iteo-gray-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function ActionCard({
  href,
  icon,
  title,
  description,
  primary = false,
  onClick,
}: {
  href?: string;
  icon: IconName;
  title: string;
  description?: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  const className = `group flex items-start gap-4 rounded-2xl border p-5 transition ${
    primary
      ? 'border-iteo-yellow bg-iteo-yellow-light hover:bg-iteo-yellow/20'
      : 'border-iteo-gray-200 bg-white hover:border-iteo-yellow hover:shadow-md'
  }`;

  const content = (
    <>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          primary ? 'bg-iteo-yellow text-iteo-black' : 'bg-iteo-gray-100 text-iteo-black group-hover:bg-iteo-yellow/20'
        }`}
      >
        <IteoIcon name={icon} size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-iteo-black group-hover:text-iteo-yellow-dark">{title}</p>
        {description && <p className="mt-1 text-sm text-iteo-gray-500">{description}</p>}
      </div>
      <span className="mt-1 shrink-0 text-iteo-yellow opacity-0 transition group-hover:opacity-100">→</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`w-full text-left ${className}`}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href ?? '#'} className={className}>
      {content}
    </Link>
  );
}

export function EmptyState({
  icon = 'grid',
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-iteo-gray-200 bg-white px-6 py-12 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-iteo-gray-100 text-iteo-gray-500">
        <IteoIcon name={icon} size={28} />
      </span>
      <p className="font-semibold text-iteo-black">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-iteo-gray-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-iteo-gray-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end">
      {children}
    </div>
  );
}

export function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-sm">
      <span className="font-medium text-iteo-gray-500">{label}</span>
      {children}
    </label>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
  type = 'button',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-xl bg-iteo-yellow px-4 py-2.5 text-sm font-semibold text-iteo-black transition hover:bg-iteo-yellow-dark disabled:opacity-60"
    >
      {children}
    </button>
  );
}

/* ── Responsive table ── */

export interface ResponsiveColumn {
  key: string;
  label: string;
  mobileLabel?: boolean;
}

export function ResponsiveTable({
  columns,
  rows,
  emptyMessage = 'Kayıt bulunamadı',
  renderCell,
}: {
  columns: ResponsiveColumn[];
  rows: Array<Record<string, ReactNode>>;
  emptyMessage?: string;
  renderCell?: (key: string, row: Record<string, ReactNode>) => ReactNode;
}) {
  if (rows.length === 0) {
    return <EmptyState icon="grid" title={emptyMessage} description="Filtreleri değiştirmeyi veya yeni kayıt eklemeyi deneyin." />;
  }

  const cell = (key: string, row: Record<string, ReactNode>) =>
    renderCell ? renderCell(key, row) : row[key];

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-iteo-gray-200 bg-white md:block">
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
                    {cell(col.key, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row, i) => (
          <div key={i} className="rounded-2xl border border-iteo-gray-200 bg-white p-4 shadow-sm">
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex items-start justify-between gap-3 border-b border-iteo-gray-100 py-2 last:border-0"
              >
                <span className="text-xs font-medium text-iteo-gray-500">{col.label}</span>
                <span className="text-right text-sm text-iteo-black">{cell(col.key, row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export function LoadingBlock() {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-iteo-gray-200 bg-white p-12">
      <div className="flex items-center gap-3 text-sm text-iteo-gray-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-iteo-gray-200 border-t-iteo-yellow" />
        Yükleniyor...
      </div>
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-iteo-danger/30 bg-iteo-danger-light p-4 text-sm text-iteo-danger">
      {message}
    </div>
  );
}
