export type MemberCockpitTheme = 'light' | 'dark';

const STORAGE_KEY = 'iteo_member_cockpit_theme';

export function readMemberCockpitTheme(): MemberCockpitTheme {
  if (typeof window === 'undefined') return 'light';
  const value = localStorage.getItem(STORAGE_KEY);
  return value === 'dark' ? 'dark' : 'light';
}

export function storeMemberCockpitTheme(theme: MemberCockpitTheme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, theme);
}
