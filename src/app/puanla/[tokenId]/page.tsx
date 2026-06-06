'use client';

import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import { sanitizeApiError } from '@/lib/api/errors';

export default function PublicRatingPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;

  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/public/ratings/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId,
          score,
          comment: comment.trim() || undefined,
        }),
      });

      const json = (await response.json()) as { message?: string | string[] };
      if (!response.ok) {
        const raw =
          typeof json.message === 'string'
            ? json.message
            : Array.isArray(json.message)
              ? json.message.join(', ')
              : 'Puan gönderilemedi';
        throw new Error(sanitizeApiError(raw, 'Puan gönderilemedi'));
      }

      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-iteo-gray-100 p-4">
        <div className="w-full max-w-md rounded-2xl border border-iteo-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">⭐</p>
          <h1 className="mt-4 text-xl font-bold text-iteo-black">Teşekkürler!</h1>
          <p className="mt-2 text-iteo-gray-600">Puanınız başarıyla kaydedildi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-iteo-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-iteo-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-iteo-black">Şoförünüzü Puanlayın</h1>
        <p className="mt-1 text-sm text-iteo-gray-500">Yolculuk deneyiminizi değerlendirin</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-iteo-gray-700">Puan (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScore(n)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${score === n ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200 text-iteo-gray-500'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-iteo-gray-700">
              Yorum (isteğe bağlı)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Deneyiminizi kısaca yazın..."
              rows={4}
              maxLength={1000}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-iteo-yellow py-3 font-semibold text-iteo-black disabled:opacity-60">
            {saving ? 'Gönderiliyor...' : 'Puanı Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
}
