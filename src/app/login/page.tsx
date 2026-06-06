'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/auth/client';
import { friendlyAuthError } from '@/lib/member';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginAdmin(email, password);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(friendlyAuthError((err as Error).message));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-iteo-black p-12 text-white">
        <div className="flex items-center gap-4">
          <Image src="/iteo_logo.jpeg" alt="İTEO Logo" width={64} height={64} className="rounded-xl" />
          <div>
            <p className="text-sm text-iteo-yellow font-semibold tracking-wide uppercase">
              İstanbul Taksiciler Esnaf Odası
            </p>
            <h1 className="text-2xl font-bold">İTEO Yönetim Paneli</h1>
          </div>
        </div>
        <p className="max-w-md text-lg text-white/80 leading-relaxed">
          Oda yönetim panelinize güvenle erişin. Duyurular, üyeler ve operasyonlar tek ekranda.
        </p>
        <p className="text-sm text-white/50">© {new Date().getFullYear()} İTEO</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-6 inline-block text-sm text-iteo-gray-500 hover:text-iteo-black">
            ← Giriş türü seç
          </Link>
          <div className="mb-8 flex flex-col items-center lg:items-start">
            <Image src="/iteo_logo.jpeg" alt="İTEO Logo" width={80} height={80} className="mb-4 rounded-xl lg:hidden" />
            <h2 className="text-2xl font-bold text-iteo-black">Admin Girişi</h2>
            <p className="mt-2 text-iteo-gray-500">Yönetici hesabınızla oturum açın.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-iteo-black">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@iteo.org.tr"
                required
                className="w-full rounded-lg border border-iteo-gray-200 bg-white px-4 py-3 text-iteo-black outline-none focus:border-iteo-yellow focus:ring-2 focus:ring-iteo-yellow/30"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-iteo-black">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-iteo-gray-200 bg-white px-4 py-3 text-iteo-black outline-none focus:border-iteo-yellow focus:ring-2 focus:ring-iteo-yellow/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-iteo-yellow px-4 py-3.5 text-base font-semibold text-iteo-black transition-colors hover:bg-iteo-yellow-dark disabled:opacity-60"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
