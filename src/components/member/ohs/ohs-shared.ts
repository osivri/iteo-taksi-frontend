import type { StatusTone } from '@/components/ui/DesignSystem';

export interface OhsContent {
  id: string;
  title: string;
  type: string;
  category: string;
}

export interface OhsDetail extends OhsContent {
  description: string | null;
  body: string | null;
  videoUrl: string | null;
}

export const typeLabels: Record<string, string> = {
  VIDEO: 'Video',
  ARTICLE: 'Makale',
  GUIDE: 'Rehber',
  FAQ: 'Sık Sorulan Soru',
};

export function typeTone(type: string): StatusTone {
  if (type === 'VIDEO') return 'info';
  if (type === 'FAQ') return 'warning';
  if (type === 'GUIDE') return 'success';
  return 'neutral';
}
