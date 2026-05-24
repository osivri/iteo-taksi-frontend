'use client';

import Image from 'next/image';
import Link from 'next/link';
import { loginPortalCopy, type MemberRoleSlug } from '@/lib/member';

interface Props {
  roleSlug: MemberRoleSlug;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function MemberAuthShell({ roleSlug, title, subtitle, children, footer }: Props) {
  const copy = loginPortalCopy[roleSlug];

  return (
    <div className="min-h-screen bg-iteo-black text-white">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
        <Link href="/" className="mb-8 text-sm text-white/50 hover:text-iteo-yellow">
          ← Giriş türü seç
        </Link>

        <div className="rounded-2xl border border-white/10 bg-iteo-black-soft p-8">
          <Image src="/iteo_logo.jpeg" alt="İTEO Logo" width={72} height={72} className="mx-auto mb-4 rounded-xl" />
          <span className="mx-auto block w-fit rounded-full bg-iteo-yellow px-3 py-1 text-xs font-bold text-iteo-black">
            {copy.badge}
          </span>
          <h1 className="mt-4 text-center text-2xl font-extrabold">{title}</h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-white/65">
            {subtitle ?? copy.subtitle}
          </p>
          {children}
        </div>

        {footer ?? (
          <p className="mt-8 text-center text-xs text-white/40">
            Oda yöneticisi misiniz?{' '}
            <Link href="/login" className="text-iteo-yellow underline">
              Web yönetim paneline giriş yapın
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
