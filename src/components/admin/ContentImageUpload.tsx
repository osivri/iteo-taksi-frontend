'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { api, ApiResponse } from '@/lib/api/client';
import { validateImageFile } from '@/lib/upload-limits';

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  disabled?: boolean;
}

export function ContentImageUpload({
  value,
  onChange,
  label = 'Kapak görseli',
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
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
      const res = await api.upload<ApiResponse<{ url: string }>>('/storage/content-images', formData);
      const url = res.data?.url;
      if (!url) throw new Error('Görsel yüklenemedi');
      onChange(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-iteo-gray-700">{label}</p>
      <div className="flex flex-wrap items-start gap-4">
        {value ? (
          <Image
            src={value}
            alt="Kapak önizleme"
            width={120}
            height={80}
            className="h-20 w-32 rounded-lg border border-iteo-gray-200 object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-iteo-gray-300 bg-iteo-gray-50 text-xs text-iteo-gray-400">
            Görsel yok
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) handleFile(file);
            }}
          />
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-iteo-gray-200 px-3 py-2 text-sm font-medium hover:bg-iteo-gray-50 disabled:opacity-50">
            {uploading ? 'Yükleniyor...' : value ? 'Görseli değiştir' : 'Görsel yükle'}
          </button>
          {value && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(null)}
              className="text-xs text-red-600 hover:underline">
              Görseli kaldır
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export const ANNOUNCEMENT_CATEGORIES = ['Genel', 'Etkinlik', 'Uyarı', 'Mevzuat', 'Ödeme', 'Acil'];
export const NEWS_CATEGORIES = ['Sektör', 'Oda', 'Etkinlik', 'Duyuru', 'Basın', 'Diğer'];

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Düşük',
  NORMAL: 'Normal',
  HIGH: 'Yüksek',
  URGENT: 'Acil',
};
