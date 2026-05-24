'use client';

import { useState } from 'react';
import { acceptKvkkConsent } from '@/lib/member-profile';

export default function PanelKvkkPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    try {
      await acceptKvkkConsent();
      window.location.href = '/panel';
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-iteo-black px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-iteo-black-soft p-8 text-white">
        <h1 className="text-xl font-bold text-iteo-yellow">KVKK Aydınlatma Metni</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/75">
          İstanbul Taksiciler Esnaf Odası dijital platformu kapsamında kişisel verileriniz; üyelik
          işlemleri, randevu ve ödeme süreçleri, duyuru/bildirim hizmetleri ile muhasebe kayıtlarının
          yürütülmesi amacıyla işlenmektedir.
          {'\n\n'}
          Verileriniz yalnızca hizmet sunumu ve yasal yükümlülükler için kullanılır. Devam ederek
          aydınlatma metnini okuduğunuzu ve kabul ettiğinizi beyan edersiniz.
        </p>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <button
          type="button"
          onClick={accept}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-iteo-yellow py-3.5 text-sm font-bold text-iteo-black disabled:opacity-60">
          {loading ? 'Kaydediliyor...' : 'Okudum, Kabul Ediyorum'}
        </button>
      </div>
    </div>
  );
}
