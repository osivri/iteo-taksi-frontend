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

interface OhsDetail {
  id: string;
  title: string;
  description: string | null;
  body: string | null;
  type: string;
  category: string;
  videoUrl: string | null;
}

const typeLabels: Record<string, string> = {
  VIDEO: 'Video',
  ARTICLE: 'Makale',
  GUIDE: 'Rehber',
  FAQ: 'Sık Sorulan Soru',
};

export default function PanelOhsPage() {
  const [items, setItems] = useState<OhsContent[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OhsDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<OhsContent> & { items: OhsContent[] }>('/ohs/contents?limit=20')
      .then((res) => setItems(res.items ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<OhsDetail>>(`/ohs/contents/${id}`);
      setDetail(res.data ?? null);
    } catch (e) {
      setError((e as Error).message);
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }

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

      <div className="space-y-4 rounded-xl border border-iteo-gray-200 bg-white p-6">
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
          className="rounded-lg bg-iteo-yellow px-5 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-60"
        >
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
              <button
                key={item.id}
                type="button"
                onClick={() => openDetail(item.id)}
                className="rounded-xl border border-iteo-gray-200 bg-white p-4 text-left transition-colors hover:border-iteo-yellow hover:bg-iteo-yellow-light/30"
              >
                <p className="text-xs font-semibold uppercase text-iteo-yellow">{item.category}</p>
                <p className="mt-1 font-semibold text-iteo-black">{item.title}</p>
                <p className="mt-1 text-xs text-iteo-gray-500">{typeLabels[item.type] ?? item.type}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-iteo-black">
                {detail?.title ?? 'İçerik Detayı'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setDetail(null);
                }}
                className="rounded-lg px-2 py-1 text-sm text-iteo-gray-500 hover:bg-iteo-gray-100"
              >
                Kapat
              </button>
            </div>
            {detailLoading ? (
              <p className="text-sm text-iteo-gray-500">Yükleniyor...</p>
            ) : detail ? (
              <div className="space-y-4 text-sm text-iteo-gray-800">
                <p className="text-xs font-semibold uppercase text-iteo-yellow">
                  {detail.category} · {typeLabels[detail.type] ?? detail.type}
                </p>
                {detail.description && (
                  <p className="leading-relaxed">{detail.description}</p>
                )}
                {detail.body && (
                  <div className="whitespace-pre-wrap rounded-lg bg-iteo-gray-100 p-4 leading-relaxed">
                    {detail.body}
                  </div>
                )}
                {detail.videoUrl && (
                  <a
                    href={detail.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-medium text-iteo-yellow hover:underline"
                  >
                    Videoyu Aç
                  </a>
                )}
                {!detail.description && !detail.body && !detail.videoUrl && (
                  <p className="text-iteo-gray-500">Detay içerik bulunmuyor.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
