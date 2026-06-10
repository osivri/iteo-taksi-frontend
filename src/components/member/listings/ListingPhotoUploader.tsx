'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { IteoIcon } from '@/components/ui/icons';
import { IMAGE_ACCEPT, validateImageFile } from '@/lib/upload-limits';

export const MAX_LISTING_PHOTOS = 8;

export interface ListingPhotoItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface Props {
  photos: ListingPhotoItem[];
  onChange: (photos: ListingPhotoItem[]) => void;
  error?: string | null;
  onError: (message: string | null) => void;
}

export function ListingPhotoUploader({ photos, onChange, error, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    onError(null);

    const next = [...photos];
    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_LISTING_PHOTOS) {
        onError(`En fazla ${MAX_LISTING_PHOTOS} fotoğraf ekleyebilirsiniz.`);
        break;
      }
      const validation = validateImageFile(file);
      if (validation) {
        onError(validation);
        continue;
      }
      next.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    onChange(next);
  }

  function removePhoto(id: string) {
    const item = photos.find((p) => p.id === id);
    if (item) URL.revokeObjectURL(item.previewUrl);
    onChange(photos.filter((p) => p.id !== id));
    onError(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-iteo-black">Fotoğraflar</p>
        <span className="text-xs text-iteo-gray-500">
          {photos.length}/{MAX_LISTING_PHOTOS} · JPG, PNG, WebP · max 3 MB
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-iteo-gray-200 bg-iteo-gray-50">
            <Image src={photo.previewUrl} alt="" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => removePhoto(photo.id)}
              className="absolute right-2 top-2 rounded-lg bg-iteo-black/75 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100"
            >
              Kaldır
            </button>
          </div>
        ))}

        {photos.length < MAX_LISTING_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-iteo-gray-200 bg-iteo-gray-50 text-iteo-gray-500 transition hover:border-iteo-yellow hover:bg-iteo-yellow/5 hover:text-iteo-black"
          >
            <IteoIcon name="grid" size={24} />
            <span className="text-xs font-semibold">Fotoğraf Ekle</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {error && <p className="text-sm text-iteo-danger">{error}</p>}
    </div>
  );
}
