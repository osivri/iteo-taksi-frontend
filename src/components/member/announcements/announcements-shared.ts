import type { StatusTone } from '@/components/ui/DesignSystem';
import { PRIORITY_LABELS } from '@/components/admin/ContentImageUpload';

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

export const PRIORITY_ORDER: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
};

export function priorityLabel(priority: string) {
  return PRIORITY_LABELS[priority] ?? priority;
}

export function priorityTone(priority: string): StatusTone {
  if (priority === 'URGENT') return 'danger';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'NORMAL') return 'info';
  return 'neutral';
}

export function formatShortDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatLongDate(value: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function contentPreview(content: string, max = 140) {
  const text = content.trim().replace(/\s+/g, ' ');
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export function sortAnnouncements(items: AnnouncementItem[]) {
  return [...items].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 9;
    const pb = PRIORITY_ORDER[b.priority] ?? 9;
    if (pa !== pb) return pa - pb;
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  });
}
