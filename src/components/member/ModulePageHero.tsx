import type { ReactNode } from 'react';

interface Props {
  badge: string;
  title: string;
  description: string;
  decoration?: ReactNode;
}

export function ModulePageHero({ badge, title, description, decoration }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-iteo-black via-[#151515] to-[#262626] px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-iteo-yellow/15 blur-2xl" />
      {decoration}
      <div className="relative max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-iteo-yellow">{badge}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-3 text-sm text-white/65 sm:text-base">{description}</p>
      </div>
    </div>
  );
}
