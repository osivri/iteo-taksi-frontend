/** İTEO kurumsal renk paleti — sarı, siyah, beyaz */
export const iteoColors = {
  yellow: '#FFC700',
  yellowDark: '#E6B300',
  yellowLight: '#FFF3CC',
  black: '#0A0A0A',
  blackSoft: '#1A1A1A',
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray500: '#737373',
  gray700: '#404040',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#F59E0B',
} as const;

export type IteoColor = keyof typeof iteoColors;
