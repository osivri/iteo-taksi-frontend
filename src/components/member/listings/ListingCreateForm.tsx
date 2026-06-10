'use client';

import { FormEvent } from 'react';
import { IteoIcon } from '@/components/ui/icons';
import { PlateSelectField } from '@/components/member/PlateSelectField';
import type { MemberVehicle } from '@/lib/member-vehicles';
import { DistrictNeighborhoodFields } from './DistrictNeighborhoodFields';
import { ListingPhotoUploader, type ListingPhotoItem } from './ListingPhotoUploader';
import { fuelTypeOptions, inputClass, labelClass, typeLabels } from './listings-shared';

interface Props {
  type: string;
  title: string;
  description: string;
  price: string;
  district: string;
  neighborhood: string;
  contactPhone: string;
  brand: string;
  model: string;
  vehicleYear: string;
  vehicleId: string;
  mileage: string;
  fuelType: string;
  damageInfo: string;
  photos: ListingPhotoItem[];
  photoError: string | null;
  saving: boolean;
  onTypeChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onDistrictChange: (v: string) => void;
  onNeighborhoodChange: (v: string) => void;
  onContactPhoneChange: (v: string) => void;
  onBrandChange: (v: string) => void;
  onModelChange: (v: string) => void;
  onVehicleYearChange: (v: string) => void;
  onVehicleIdChange: (vehicleId: string, vehicle: MemberVehicle | null) => void;
  onMileageChange: (v: string) => void;
  onFuelTypeChange: (v: string) => void;
  onDamageInfoChange: (v: string) => void;
  onPhotosChange: (photos: ListingPhotoItem[]) => void;
  onPhotoError: (message: string | null) => void;
  onSubmit: (e: FormEvent) => void;
}

export function ListingCreateForm({
  type,
  title,
  description,
  price,
  district,
  neighborhood,
  contactPhone,
  brand,
  model,
  vehicleYear,
  vehicleId,
  mileage,
  fuelType,
  damageInfo,
  photos,
  photoError,
  saving,
  onTypeChange,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onDistrictChange,
  onNeighborhoodChange,
  onContactPhoneChange,
  onBrandChange,
  onModelChange,
  onVehicleYearChange,
  onVehicleIdChange,
  onMileageChange,
  onFuelTypeChange,
  onDamageInfoChange,
  onPhotosChange,
  onPhotoError,
  onSubmit,
}: Props) {
  const isPlateSale = type === 'PLATE_SALE';

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border border-iteo-yellow/40 bg-iteo-yellow/10 px-4 py-3 text-sm text-iteo-black">
        İlanınız oda onayından sonra yayına alınır. Araç/plaka bilgilerini eksiksiz girin; fotoğraf eklemek ilanınızın
        görünürlüğünü artırır.
      </div>

      <div className="rounded-xl border border-iteo-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="mb-4 text-sm font-bold text-iteo-black">İlan Kategorisi</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(['VEHICLE_RENTAL', 'PLATE_SALE'] as const).map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onTypeChange(t)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  active
                    ? 'border-iteo-yellow bg-iteo-yellow/15 ring-2 ring-iteo-yellow/30'
                    : 'border-iteo-gray-200 hover:border-iteo-yellow/50'
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-iteo-yellow' : 'bg-iteo-gray-100'}`}
                >
                  <IteoIcon name={t === 'VEHICLE_RENTAL' ? 'taxi' : 'pin'} size={22} />
                </div>
                <div>
                  <p className="font-bold text-iteo-black">{typeLabels[t]}</p>
                  <p className="mt-1 text-xs text-iteo-gray-500">
                    {t === 'VEHICLE_RENTAL' ? 'Günlük / aylık araç kiralama' : 'Plaka devri ve satış ilanları'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-iteo-gray-200 bg-white p-5 shadow-sm sm:p-6 space-y-4">
        <p className="text-sm font-bold text-iteo-black">Araç & Plaka Bilgileri</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className={labelClass}>Marka</span>
            <input
              value={brand}
              onChange={(e) => onBrandChange(e.target.value)}
              placeholder="Örn. Toyota"
              maxLength={80}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className={labelClass}>Model</span>
            <input
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              placeholder="Örn. Corolla"
              maxLength={80}
              className={inputClass}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1.5">
            <span className={labelClass}>Model Yılı</span>
            <input
              value={vehicleYear}
              onChange={(e) => onVehicleYearChange(e.target.value)}
              type="number"
              min={1950}
              max={2100}
              placeholder="2018"
              className={inputClass}
            />
          </label>
          <div className="sm:col-span-2">
            <PlateSelectField
              value={vehicleId}
              onChange={onVehicleIdChange}
              required={isPlateSale}
              label="Plaka"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className={labelClass}>Kilometre</span>
            <input
              value={mileage}
              onChange={(e) => onMileageChange(e.target.value)}
              type="number"
              min={0}
              placeholder="125000"
              className={inputClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className={labelClass}>Yakıt Tipi</span>
            <select value={fuelType} onChange={(e) => onFuelTypeChange(e.target.value)} className={inputClass}>
              {fuelTypeOptions.map((opt) => (
                <option key={opt.value || 'empty'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className={labelClass}>Hasar & Durum Bilgisi</span>
          <textarea
            value={damageInfo}
            onChange={(e) => onDamageInfoChange(e.target.value)}
            placeholder="Kaporta boyası, tramer kaydı, motor/şanzıman durumu, eksik parçalar..."
            rows={4}
            maxLength={3000}
            className={inputClass}
          />
        </label>
      </div>

      <div className="rounded-xl border border-iteo-gray-200 bg-white p-5 shadow-sm sm:p-6 space-y-4">
        <p className="text-sm font-bold text-iteo-black">İlan Bilgileri</p>

        <label className="block space-y-1.5">
          <span className={labelClass}>İlan Başlığı *</span>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Örn. 2018 Toyota Corolla günlük kiralanır"
            required
            maxLength={200}
            className={inputClass}
          />
        </label>

        <label className="block space-y-1.5">
          <span className={labelClass}>Açıklama</span>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Kiralama şartları, çalışma saatleri, ek notlar..."
            rows={5}
            className={inputClass}
          />
        </label>

        <ListingPhotoUploader
          photos={photos}
          onChange={onPhotosChange}
          error={photoError}
          onError={onPhotoError}
        />

        <label className="block space-y-1.5">
          <span className={labelClass}>Fiyat (₺) *</span>
          <input
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            type="number"
            min={0}
            step={1}
            required
            placeholder="15000"
            className={`${inputClass} text-lg font-bold`}
          />
        </label>

        <DistrictNeighborhoodFields
          district={district}
          neighborhood={neighborhood}
          onDistrictChange={onDistrictChange}
          onNeighborhoodChange={onNeighborhoodChange}
        />

        <label className="block space-y-1.5">
          <span className={labelClass}>İletişim Telefonu</span>
          <input
            value={contactPhone}
            onChange={(e) => onContactPhoneChange(e.target.value)}
            placeholder="05XX XXX XX XX"
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          disabled={saving || !title.trim() || !price || (isPlateSale && !vehicleId)}
          className="w-full rounded-xl bg-iteo-yellow py-3.5 text-sm font-bold text-iteo-black transition hover:bg-iteo-yellow/90 disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {saving ? 'Gönderiliyor...' : 'Onaya Gönder'}
        </button>
      </div>
    </form>
  );
}
