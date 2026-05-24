'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { registerMember } from '@/lib/auth/client';
import { MemberAuthShell } from '@/components/member/MemberAuthShell';
import {
  friendlyAuthError,
  loginPortalCopy,
  roleSlugToMemberRole,
  setLoginIntent,
  type MemberRoleSlug,
} from '@/lib/member';

interface Props {
  roleSlug: MemberRoleSlug;
}

export function MemberRegisterForm({ roleSlug }: Props) {
  const copy = loginPortalCopy[roleSlug];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoginIntent(roleSlug);
  }, [roleSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    const intendedRole = roleSlugToMemberRole[roleSlug];

    try {
      const result = await registerMember(email, password, intendedRole);
      setLoading(false);

      if (result.accessToken) {
        window.location.href = '/panel/onboarding';
        return;
      }

      setSuccess(
        result.message ??
          'Kayıt oluşturuldu. E-posta doğrulama linki gönderildiyse gelen kutunuzu kontrol edin, ardından giriş yapabilirsiniz.',
      );
    } catch (err) {
      setLoading(false);
      setError(friendlyAuthError((err as Error).message));
    }
  }

  const loginHref = `/giris?rol=${roleSlug}`;

  return (
    <MemberAuthShell
      roleSlug={roleSlug}
      title="Kayıt Ol"
      subtitle={`${copy.badge} için e-posta ve şifre ile hesap oluşturun.`}>
      {error && (
        <div className="mt-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
      {success && (
        <div className="mt-6 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div>
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
            autoComplete="new-password"
            placeholder="En az 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl bg-white px-4 py-3.5 text-iteo-black outline-none focus:ring-2 focus:ring-iteo-yellow/40"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm text-white/70">
            Şifre Tekrar
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Şifrenizi tekrar girin"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl bg-white px-4 py-3.5 text-iteo-black outline-none focus:ring-2 focus:ring-iteo-yellow/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-iteo-yellow py-3.5 text-sm font-bold text-iteo-black disabled:opacity-60">
          {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Zaten hesabınız var mı?{' '}
        <Link href={loginHref} className="font-semibold text-iteo-yellow hover:underline">
          Giriş yapın
        </Link>
      </p>
    </MemberAuthShell>
  );
}
