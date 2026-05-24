const TR_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const TR_WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = startOfDay(date).getTime();
  return t >= startOfDay(start).getTime() && t <= startOfDay(end).getTime();
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getCalendarDays(month: Date): Date[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = addDays(first, -startOffset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function formatMonthLabel(month: Date): string {
  return `${TR_MONTHS[month.getMonth()]} ${month.getFullYear()}`;
}

export function formatDisplayDate(key: string): string {
  const date = parseDateKey(key);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function weekdayLabels(): string[] {
  return TR_WEEKDAYS;
}

export const SERVICE_TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

export const HOTEL_ROOM_TYPES = [
  { value: 'STANDARD', label: 'Standart Oda' },
  { value: 'DELUXE', label: 'Deluxe Oda' },
  { value: 'SUITE', label: 'Suit Oda' },
];

export const SERVICE_TYPES = [
  'Periyodik bakım',
  'Fren bakımı',
  'Lastik değişimi',
  'Motor arızası',
  'Kaporta / boya',
  'Diğer',
];
