'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { api, ApiResponse } from '@/lib/api/client';
import { fetchCurrentProfile } from '@/lib/member-profile';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';
import { validateImageFile } from '@/lib/upload-limits';
import type { MemberProfile } from '@/lib/member';
import { parseApiItems } from '@/lib/parse-api-list';

interface Vehicle {
  id: string;
  plateNumber: string;
}

interface ForgottenItem {
  id: string;
  plateNumber: string;
  description: string;
  photoUrl: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

interface UploadResult {
  path: string;
  url: string;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Odaya iletildi',
  REVIEWING: 'İnceleniyor',
  RETURNED: 'Teslim edildi',
  CLOSED: 'Kapatıldı',
};

export default function PanelForgottenItemsPage() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [items, setItems] = useState<ForgottenItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [vehicleId, setVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAccess = profile?.role === 'DRIVER' || profile?.role === 'PLATE_OWNER';

  const load = useCallback(async () => {
    const p = await fetchCurrentProfile();
    setProfile(p);

    if (!p || (p.role !== 'DRIVER' && p.role !== 'PLATE_OWNER')) return;

    const [itemsRes, vehiclesRes] = await Promise.all([
      api.get<ApiResponse<ForgottenItem> & { items: ForgottenItem[] }>('/forgotten-items'),
      api.get<ApiResponse<Vehicle[]>>('/vehicles?limit=100'),
    ]);

    setItems(itemsRes.items ?? []);
    const v = parseApiItems<Vehicle>(vehiclesRes);
    setVehicles(v);
    if (v[0]) setVehicleId((current) => current || v[0].id);
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  async function uploadPhoto(file: File) {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const upload = await api.upload<ApiResponse<UploadResult>>('/storage/forgotten-items', formData);
      const path = upload.data?.path;
      if (!path) throw new Error('Fotoğraf yüklenemedi');
      setPhotoPath(path);
      setPhotoPreview((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    } catch (err) {
      setError((err as Error).message);
      setPhotoPath(null);
      setPhotoPreview(null);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!vehicleId || !description.trim() || !photoPath) {
      setError('Plaka, açıklama ve fotoğraf zorunludur.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.post('/forgotten-items', {
        vehicleId,
        description: description.trim(),
        photoPath,
      });
      setDescription('');
      setPhotoPath(null);
      setPhotoPreview((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return null;
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock />;

  if (!canAccess) {
    return (
      <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
        Unutulan eşya bildirimi yalnızca şoförler ve mal sahipleri içindir.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unutulan Eşya"
        description="Araçta bulunan unutulan eşyayı fotoğraflayıp odaya bildirin."
      />

      {error && <ErrorBlock message={error} />}

      <form onSubmit={handleSubmit} className="rounded-xl border border-iteo-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-iteo-black">Yeni bildirim</h2>

        {vehicles.length === 0 ? (
          <p className="text-sm text-iteo-gray-500">Bildirim için önce kayıtlı bir plakanız olmalı.</p>
        ) : (
          <>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-iteo-gray-500">Plaka</label>
              <div className="flex flex-wrap gap-2">
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVehicleId(v.id)}
                    className={`rounded-full border px-3 py-1 text-sm font-semibold ${vehicleId === v.id ? 'border-iteo-yellow bg-iteo-yellow-light' : 'border-iteo-gray-200'}`}>
                    {v.plateNumber}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Eşya açıklaması (örn. Siyah deri cüzdan)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
            />

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-iteo-gray-500">Fotoğraf</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto(file);
                }}
                className="block w-full text-sm text-iteo-gray-600"
              />
              {uploading && <p className="mt-2 text-sm text-iteo-yellow-dark">Fotoğraf yükleniyor...</p>}
              {photoPreview && (
                <div className="relative mt-3 h-48 w-full max-w-sm overflow-hidden rounded-lg border border-iteo-gray-200">
                  <Image src={photoPreview} alt="Önizleme" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || uploading || !photoPath}
              className="rounded-lg bg-iteo-yellow px-5 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-60">
              {saving ? 'Gönderiliyor...' : 'Odaya Bildir'}
            </button>
          </>
        )}
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-iteo-black">Bildirimlerim</h2>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center text-iteo-gray-500">
            Henüz bildiriminiz yok.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border border-iteo-gray-200 bg-white">
                {item.photoUrl && (
                  <div className="relative h-40 w-full bg-iteo-gray-100">
                    <Image src={item.photoUrl} alt={item.description} fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-iteo-black">{item.plateNumber}</p>
                    <span className="rounded-full bg-iteo-gray-100 px-2 py-0.5 text-xs font-medium">
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </div>
                  <p className="text-sm text-iteo-gray-700">{item.description}</p>
                  {item.adminNote && <p className="text-xs text-iteo-gray-500">Oda notu: {item.adminNote}</p>}
                  <p className="text-xs text-iteo-gray-400">{new Date(item.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
