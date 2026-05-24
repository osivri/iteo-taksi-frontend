'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import { completeOnboarding } from '@/lib/member-profile';
import { getRegistrationRole, registrationRoleLabel } from '@/lib/member';

export default function PanelOnboardingPage() {
  const role = useMemo(() => getRegistrationRole(), []);
  const roleLabel = registrationRoleLabel(role);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Ad ve soyad zorunludur.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await completeOnboarding({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
      });
      window.location.href = '/panel/kvkk';
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-iteo-black px-6 py-16">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/10 bg-iteo-black-soft p-8">
        <Image src="/iteo_logo.jpeg" alt="İTEO" width={64} height={64} className="mx-auto mb-4 rounded-xl" />
        <span className="mx-auto block w-fit rounded-full bg-iteo-yellow px-3 py-1 text-xs font-bold text-iteo-black">
          {roleLabel}
        </span>
        <h1 className="mt-4 text-center text-xl font-bold text-white">Profilinizi Tamamlayın</h1>
        <p className="mt-2 text-center text-sm text-white/60">
          Ad ve soyad bilgilerinizi girin; {roleLabel.toLowerCase()} hemen kullanıma açılır.
        </p>

        {error && <p className="mt-4 text-center text-sm text-red-300">{error}</p>}

        <div className="mt-6 space-y-3">
          <input
            placeholder="Ad"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-xl bg-white px-4 py-3 text-iteo-black"
          />
          <input
            placeholder="Soyad"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-xl bg-white px-4 py-3 text-iteo-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-iteo-yellow py-3.5 text-sm font-bold text-iteo-black disabled:opacity-60">
          {loading ? 'Kaydediliyor...' : 'Devam Et'}
        </button>
      </form>
    </div>
  );
}
