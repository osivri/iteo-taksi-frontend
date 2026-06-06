'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface ServiceRequest {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  plateNumber: string | null;
  locationAddress: string | null;
  adminNote: string | null;
  createdAt: string;
}

const tabs = [
  { type: 'TOW', label: 'Çekici' },
  { type: 'INSURANCE', label: 'Sigorta' },
  { type: 'COMPLAINT', label: 'Şikayet' },
  { type: 'PIRATE_REPORT', label: 'Korsan İhbar' },
  { type: 'PETITION', label: 'Dilekçe' },
] as const;

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  ASSIGNED: 'Atandı',
  IN_PROGRESS: 'İşlemde',
  COMPLETED: 'Tamamlandı',
  REJECTED: 'Reddedildi',
  CANCELLED: 'İptal',
};

export default function PanelServicesPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['type']>('TOW');
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [locationAddress, setLocationAddress] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<ServiceRequest> & { items: ServiceRequest[] }>(
        '/service-requests',
      );
      setItems(res.items ?? []);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/service-requests', {
        type: activeTab,
        title: title.trim(),
        description: description.trim() || undefined,
        plateNumber: plateNumber.trim() || undefined,
        locationAddress: locationAddress.trim() || undefined,
      });
      setTitle('');
      setDescription('');
      setPlateNumber('');
      setLocationAddress('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const filteredItems = items.filter((i) => i.type === activeTab);

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Oda Hizmetleri"
        description="Çekici, sigorta, şikayet ve diğer oda hizmet talepleriniz"
      />
      {error && <ErrorBlock message={error} />}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => setActiveTab(t.type)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${activeTab === t.type ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-iteo-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-iteo-black">
          Yeni {tabs.find((t) => t.type === activeTab)?.label} Talebi
        </h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Başlık"
          required
          className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama (isteğe bağlı)"
          rows={3}
          className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
        />
        {(activeTab === 'TOW' || activeTab === 'INSURANCE' || activeTab === 'PIRATE_REPORT') && (
          <input
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="Plaka (isteğe bağlı)"
            className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
          />
        )}
        {activeTab === 'TOW' && (
          <input
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            placeholder="Konum adresi (isteğe bağlı)"
            className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
          />
        )}
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="rounded-lg bg-iteo-yellow px-5 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-60">
          {saving ? 'Gönderiliyor...' : 'Talep Gönder'}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-iteo-black">Taleplerim</h2>
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
            Bu kategoride talebiniz yok.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-iteo-gray-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-iteo-black">{item.title}</p>
                  <span className="rounded-full bg-iteo-gray-100 px-2 py-0.5 text-xs font-medium">
                    {statusLabels[item.status] ?? item.status}
                  </span>
                </div>
                {item.description && <p className="text-sm text-iteo-gray-700">{item.description}</p>}
                {item.plateNumber && <p className="text-xs text-iteo-gray-500">Plaka: {item.plateNumber}</p>}
                {item.adminNote && <p className="text-xs text-iteo-gray-500">Oda notu: {item.adminNote}</p>}
                <p className="text-xs text-iteo-gray-400">
                  {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
