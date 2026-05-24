'use client';

import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface OhsContent {
  id: string;
  title: string;
  type: string;
  category: string;
}

export default function PanelOhsPage() {
  const [items, setItems] = useState<OhsContent[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<OhsContent> & { items: OhsContent[] }>('/ohs/contents?limit=20')
      .then((res) => setItems(res.items ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function askChatbot() {
    if (!question.trim()) return;
    setAsking(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<{ answer: string }>>('/ohs/chat', { message: question });
      setAnswer(res.data?.answer ?? 'Yanıt alınamadı');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAsking(false);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader title="İSG Danışman" description="İş sağlığı ve güvenliği eğitimleri ile danışmanlık." />

      {error && <ErrorBlock message={error} />}

      <div className="rounded-xl border border-iteo-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-iteo-black">İSG Danışmanına Sor</h2>
        <textarea
          placeholder="İSG konusunda sorunuzu yazın..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
        />
        <button
          type="button"
          onClick={askChatbot}
          disabled={asking}
          className="rounded-lg bg-iteo-yellow px-5 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-60">
          {asking ? 'Yanıtlanıyor...' : 'Sor'}
        </button>
        {answer && (
          <div className="rounded-lg bg-iteo-gray-100 p-4 text-sm leading-relaxed text-iteo-gray-800">
            {answer}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-iteo-black">Eğitim İçerikleri</h2>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
            Henüz içerik yok.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-iteo-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-iteo-yellow">{item.category}</p>
                <p className="mt-1 font-semibold text-iteo-black">{item.title}</p>
                <p className="mt-1 text-xs text-iteo-gray-500">{item.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
