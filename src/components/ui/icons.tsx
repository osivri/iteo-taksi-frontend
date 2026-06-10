import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, className, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return base({ ...props, children: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /></> });
}
export function IconUser(props: IconProps) {
  return base({ ...props, children: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" /></> });
}
export function IconFinance(props: IconProps) {
  return base({ ...props, children: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></> });
}
export function IconTaxi(props: IconProps) {
  return base({ ...props, children: <><path d="M4 16h16l-1.5-6H5.5L4 16z" /><circle cx="7.5" cy="18" r="1.5" /><circle cx="16.5" cy="18" r="1.5" /><path d="M9 10h6" /></> });
}
export function IconMegaphone(props: IconProps) {
  return base({ ...props, children: <><path d="M4 10v4l12 4V6L4 10z" /><path d="M16 8v8" /><path d="M6 14v3a2 2 0 0 0 2 2" /></> });
}
export function IconNews(props: IconProps) {
  return base({ ...props, children: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></> });
}
export function IconCard(props: IconProps) {
  return base({ ...props, children: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></> });
}
export function IconCalendar(props: IconProps) {
  return base({ ...props, children: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 11h16" /></> });
}
export function IconBriefcase(props: IconProps) {
  return base({ ...props, children: <><rect x="5" y="8" width="14" height="11" rx="2" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></> });
}
export function IconBell(props: IconProps) {
  return base({ ...props, children: <><path d="M12 3a5 5 0 0 0-5 5v3l-2 3h14l-2-3V8a5 5 0 0 0-5-5z" /><path d="M10 20a2 2 0 0 0 4 0" /></> });
}
export function IconShield(props: IconProps) {
  return base({ ...props, children: <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z" /> });
}
export function IconHelp(props: IconProps) {
  return base({ ...props, children: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.5" /><circle cx="12" cy="17" r=".75" fill="currentColor" stroke="none" /></> });
}
export function IconGrid(props: IconProps) {
  return base({ ...props, children: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></> });
}
export function IconBuilding(props: IconProps) {
  return base({ ...props, children: <><path d="M4 20V6l8-3 8 3v14" /><path d="M9 20v-5h6v5" /><path d="M9 9h1M14 9h1M9 13h1M14 13h1" /></> });
}
export function IconChart(props: IconProps) {
  return base({ ...props, children: <><path d="M4 20V4" /><path d="M8 20v-8M12 20V8M16 20v-5M20 20V10" /></> });
}
export function IconUsers(props: IconProps) {
  return base({ ...props, children: <><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.5" /><path d="M3 20c1-3 3.5-4.5 6-4.5s5 1.5 6 4.5" /><path d="M14.5 20c.5-2 2-3 3.5-3s3 1 3.5 3" /></> });
}
export function IconWrench(props: IconProps) {
  return base({ ...props, children: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-3.3-3.3 2.1-2.1z" /> });
}
export function IconStar(props: IconProps) {
  return base({ ...props, children: <path d="m12 3 2.4 5.5L20 9.5l-4.5 4 1.1 6L12 17.5 7.4 19.5 8.5 13.5 4 9.5l5.6-1L12 3z" /> });
}
export function IconClock(props: IconProps) {
  return base({ ...props, children: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> });
}
export function IconPin(props: IconProps) {
  return base({ ...props, children: <><path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" /><circle cx="12" cy="11" r="2" /></> });
}
export function IconReceipt(props: IconProps) {
  return base({ ...props, children: <><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3z" /><path d="M9 8h6M9 12h6" /></> });
}
export function IconArrowRight(props: IconProps) {
  return base({ ...props, children: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></> });
}
export function IconMenu(props: IconProps) {
  return base({ ...props, children: <><path d="M4 7h16M4 12h16M4 17h16" /></> });
}
export function IconClose(props: IconProps) {
  return base({ ...props, children: <><path d="M6 6l12 12M18 6 6 18" /></> });
}
export function IconPlus(props: IconProps) {
  return base({ ...props, children: <><path d="M12 5v14M5 12h14" /></> });
}

export type IconName =
  | 'home'
  | 'user'
  | 'finance'
  | 'taxi'
  | 'megaphone'
  | 'news'
  | 'card'
  | 'calendar'
  | 'briefcase'
  | 'bell'
  | 'shield'
  | 'help'
  | 'grid'
  | 'building'
  | 'chart'
  | 'users'
  | 'wrench'
  | 'star'
  | 'clock'
  | 'pin'
  | 'receipt';

const iconMap: Record<IconName, (props: IconProps) => React.ReactElement> = {
  home: IconHome,
  user: IconUser,
  finance: IconFinance,
  taxi: IconTaxi,
  megaphone: IconMegaphone,
  news: IconNews,
  card: IconCard,
  calendar: IconCalendar,
  briefcase: IconBriefcase,
  bell: IconBell,
  shield: IconShield,
  help: IconHelp,
  grid: IconGrid,
  building: IconBuilding,
  chart: IconChart,
  users: IconUsers,
  wrench: IconWrench,
  star: IconStar,
  clock: IconClock,
  pin: IconPin,
  receipt: IconReceipt,
};

export function IteoIcon({ name, ...props }: IconProps & { name: IconName }) {
  const Component = iconMap[name];
  return <Component {...props} />;
}
