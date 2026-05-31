'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api, ApiResponse } from '@/lib/api/client';
import { fetchCurrentProfile } from '@/lib/member-profile';
import { needsAddressSetup, type MemberProfile } from '@/lib/member';

export default function PanelAddressPage() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentProfile()
      .then((profile) => {
        if (profile && !needsAddressSetup(profile)) {
          router.replace('/panel');
          return;
        }
        if (profile?.city) setCity(profile.city);
        if (profile?.district) setDistrict(profile.district);
        if (profile?.addressLine) setAddressLine(profile.addressLine);
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!city.trim() || !district.trim() || !addressLine.trim()) {
      setError('İl, ilçe ve açık adres zorunludur.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.patch<ApiResponse<MemberProfile>>('/users/me', {
        city: city.trim(),
        district: district.trim(),
        addressLine: addressLine.trim(),
      });
      window.location.href = '/panel';
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-iteo-black text-white/70">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-iteo-black px-6 py-16">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/10 bg-iteo-black-soft p-8">
        <Image src="/iteo_logo.jpeg" alt="İTEO" width={64} height={64} className="mx-auto mb-4 rounded-xl" />
        <h1 className="text-center text-xl font-bold text-white">Adres Bilgileriniz</h1>
        <p className="mt-2 text-center text-sm text-white/60">
          Oda kayıtları ve iletişim için adres bilgilerinizi girin.
        </p>

        {error && <p className="mt-4 text-center text-sm text-red-300">{error}</p>}

        <div className="mt-6 space-y-3">
          <input
            placeholder="İl (örn. İstanbul)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl bg-white px-4 py-3 text-iteo-black"
          />
          <input
            placeholder="İlçe (örn. Kadıköy)"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full rounded-xl bg-white px-4 py-3 text-iteo-black"
          />
          <textarea
            placeholder="Açık adres (mahalle, sokak, bina no, daire)"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            rows={3}
            className="w-full rounded-xl bg-white px-4 py-3 text-iteo-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-iteo-yellow py-3.5 text-sm font-bold text-iteo-black disabled:opacity-60">
          {loading ? 'Kaydediliyor...' : 'Kaydet ve Devam Et'}
        </button>
      </form>
    </div>
  );
}
