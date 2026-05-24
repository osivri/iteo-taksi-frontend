'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { fetchCurrentProfile } from '@/lib/member-profile';
import { MemberAuthShell } from '@/components/member/MemberAuthShell';
import {
  friendlyAuthError,
  getLoginIntent,
  loginPortalCopy,
  setLoginIntent,
  type MemberRoleSlug,
} from '@/lib/member';

interface Props {
  roleSlug: MemberRoleSlug;
}

export function MemberLoginForm({ roleSlug }: Props) {
  const copy = loginPortalCopy[roleSlug];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoginIntent(roleSlug);
  }, [roleSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(friendlyAuthError(signInError.message));
      setLoading(false);
      return;
    }

    const profile = await fetchCurrentProfile();
    if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
      await supabase.auth.signOut();
      setError('Yönetici hesapları üye panelinden giriş yapamaz. Lütfen yönetim girişini kullanın.');
      setLoading(false);
      return;
    }

    setLoading(false);
    window.location.href = '/panel';
  }

  const registerHref = `/giris/kayit?rol=${roleSlug}`;

  return (
    <MemberAuthShell roleSlug={roleSlug} title={copy.title}>
      {error && (
        <div className="mt-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-white/70">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl bg-white px-4 py-3.5 text-iteo-black outline-none focus:ring-2 focus:ring-iteo-yellow/40"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-white/70">
            Şifre
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl bg-white px-4 py-3.5 text-iteo-black outline-none focus:ring-2 focus:ring-iteo-yellow/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-iteo-yellow py-3.5 text-sm font-bold text-iteo-black disabled:opacity-60">
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Hesabınız yok mu?{' '}
        <Link href={registerHref} className="font-semibold text-iteo-yellow hover:underline">
          Kayıt olun
        </Link>
      </p>
    </MemberAuthShell>
  );
}
