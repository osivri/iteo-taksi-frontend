'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface Listing {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  price: number;
  district: string | null;
  neighborhood: string | null;
  contactPhone: string | null;
  adminNote: string | null;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  VEHICLE_RENTAL: 'Araç Kiralama',
  PLATE_SALE: 'Plaka Satış',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Onay Bekliyor',
  APPROVED: 'Onaylı',
  REJECTED: 'Reddedildi',
};

type Tab = 'browse' | 'create' | 'mine';

export default function PanelListingsPage() {
  const [tab, setTab] = useState<Tab>('browse');
  const [browseItems, setBrowseItems] = useState<Listing[]>([]);
  const [myItems, setMyItems] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState('VEHICLE_RENTAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  async function loadBrowse() {
    const res = await api.get<ApiResponse<Listing> & { items: Listing[] }>('/listings');
    setBrowseItems(res.items ?? []);
  }

  async function loadMine() {
    const res = await api.get<ApiResponse<Listing> & { items: Listing[] }>('/listings/mine');
    setMyItems(res.items ?? []);
  }

  async function load() {
    setLoading(true);
    try {
      if (tab === 'browse') await loadBrowse();
      else if (tab === 'mine') await loadMine();
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/listings', {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        district: district.trim() || undefined,
        neighborhood: neighborhood.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      });
      setTitle('');
      setDescription('');
      setPrice('');
      setDistrict('');
      setNeighborhood('');
      setContactPhone('');
      setTab('mine');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading && tab !== 'create') return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader title="İlanlar" description="Araç kiralama ve plaka satış ilanları" />
      {error && <ErrorBlock message={error} />}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('browse')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'browse' ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200'}`}>
          İlanlara Göz At
        </button>
        <button
          type="button"
          onClick={() => setTab('create')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'create' ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200'}`}>
          İlan Ver
        </button>
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'mine' ? 'bg-iteo-yellow text-iteo-black' : 'border border-iteo-gray-200'}`}>
          İlanlarım
        </button>
      </div>

      {tab === 'create' && (
        <form onSubmit={handleCreate} className="rounded-xl border border-iteo-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-iteo-black">Yeni İlan</h2>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5">
            <option value="VEHICLE_RENTAL">Araç Kiralama</option>
            <option value="PLATE_SALE">Plaka Satış</option>
          </select>
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
            rows={4}
            className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Fiyat (₺)"
            type="number"
            min="0"
            required
            className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="İlçe (isteğe bağlı)"
              className="rounded-lg border border-iteo-gray-200 px-4 py-2.5"
            />
            <input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Mahalle (isteğe bağlı)"
              className="rounded-lg border border-iteo-gray-200 px-4 py-2.5"
            />
          </div>
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="İletişim telefonu (isteğe bağlı)"
            className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
          />
          <button
            type="submit"
            disabled={saving || !title.trim() || !price}
            className="rounded-lg bg-iteo-yellow px-5 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-60">
            {saving ? 'Gönderiliyor...' : 'Onaya Gönder'}
          </button>
        </form>
      )}

      {tab === 'browse' && (
        <>
          {browseItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
              Onaylı ilan bulunamadı.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {browseItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-iteo-gray-200 bg-white p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-iteo-black">{item.title}</p>
                    <span className="rounded-full bg-iteo-gray-100 px-2 py-0.5 text-xs font-medium">
                      {typeLabels[item.type] ?? item.type}
                    </span>
                  </div>
                  <p className="text-lg font-semibold">{item.price.toLocaleString('tr-TR')} ₺</p>
                  {item.description && <p className="text-sm text-iteo-gray-700">{item.description}</p>}
                  {(item.district || item.neighborhood) && (
                    <p className="text-xs text-iteo-gray-500">
                      {[item.district, item.neighborhood].filter(Boolean).join(' / ')}
                    </p>
                  )}
                  {item.contactPhone && (
                    <a href={`tel:${item.contactPhone}`} className="text-sm font-medium text-iteo-yellow-dark">
                      {item.contactPhone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'mine' && (
        <>
          {myItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
              Henüz ilanınız yok.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-iteo-gray-200 bg-white p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-iteo-black">{item.title}</p>
                    <span className="rounded-full bg-iteo-gray-100 px-2 py-0.5 text-xs font-medium">
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </div>
                  <p className="text-lg font-semibold">{item.price.toLocaleString('tr-TR')} ₺</p>
                  {item.adminNote && <p className="text-xs text-iteo-gray-500">Oda notu: {item.adminNote}</p>}
                  <p className="text-xs text-iteo-gray-400">
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
