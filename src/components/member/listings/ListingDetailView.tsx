'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/DesignSystem';
import { IteoIcon } from '@/components/ui/icons';
import type { Listing } from './listings-shared';
import {
  formatDate,
  formatLocation,
  formatPrice,
  formatVehicleSummary,
  hasVehicleDetails,
  statusLabels,
  statusTone,
  typeLabels,
} from './listings-shared';

interface Props {
  listing: Listing;
  backHref: string;
  backLabel?: string;
}

export function ListingDetailView({ listing, backHref, backLabel = 'İlanlara dön' }: Props) {
  const photos = listing.photos?.length ? listing.photos : [];
  const [activePhoto, setActivePhoto] = useState(0);
  const isRental = listing.type === 'VEHICLE_RENTAL';
  const showStatus = listing.isOwner || listing.status !== 'APPROVED';
  const vehicleSummary = formatVehicleSummary(listing);
  const showSpecs = hasVehicleDetails(listing);

  const specRows: { label: string; value: string }[] = [];
  if (listing.brand) specRows.push({ label: 'Marka', value: listing.brand });
  if (listing.model) specRows.push({ label: 'Model', value: listing.model });
  if (listing.vehicleYear) specRows.push({ label: 'Model Yılı', value: String(listing.vehicleYear) });
  if (listing.plateNumber) specRows.push({ label: 'Plaka', value: listing.plateNumber });
  if (listing.mileage != null) specRows.push({ label: 'Kilometre', value: `${listing.mileage.toLocaleString('tr-TR')} km` });
  if (listing.fuelType) specRows.push({ label: 'Yakıt', value: listing.fuelType });

  return (
    <div className="space-y-6 pb-10">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-iteo-gray-500">
        <Link href="/panel/listings" className="font-semibold text-iteo-yellow hover:underline">
          İlanlar
        </Link>
        <span>/</span>
        <span className="font-medium text-iteo-gray-600">{typeLabels[listing.type] ?? listing.type}</span>
        <span>/</span>
        <span className="line-clamp-1 text-iteo-gray-400">{listing.title}</span>
      </nav>

      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-iteo-black hover:text-iteo-yellow"
      >
        ← {backLabel}
      </Link>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-sm">
            <div className="relative aspect-[16/10] w-full bg-iteo-gray-100">
              {photos.length > 0 ? (
                <Image
                  src={photos[activePhoto]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center ${
                    isRental
                      ? 'bg-gradient-to-br from-iteo-yellow/20 via-white to-iteo-gray-50'
                      : 'bg-gradient-to-br from-iteo-black/5 via-white to-iteo-gray-50'
                  }`}
                >
                  <IteoIcon name={isRental ? 'taxi' : 'pin'} size={72} className="text-iteo-gray-300" />
                </div>
              )}
              <span className="absolute left-4 top-4 rounded-lg bg-iteo-black/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-iteo-yellow backdrop-blur">
                {typeLabels[listing.type] ?? listing.type}
              </span>
            </div>

            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-iteo-gray-100 p-3">
                {photos.map((url, idx) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActivePhoto(idx)}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                      activePhoto === idx ? 'border-iteo-yellow' : 'border-transparent'
                    }`}
                  >
                    <Image src={url} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-iteo-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h1 className="text-2xl font-black leading-tight text-iteo-black sm:text-3xl">{listing.title}</h1>
            {vehicleSummary && (
              <p className="mt-2 text-sm font-semibold text-iteo-gray-600">{vehicleSummary}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-iteo-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <IteoIcon name="pin" size={16} className="text-iteo-gray-400" />
                {formatLocation(listing)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IteoIcon name="clock" size={16} className="text-iteo-gray-400" />
                {formatDate(listing.createdAt)}
              </span>
              <span className="text-iteo-gray-400">İlan No: {listing.id.slice(0, 8).toUpperCase()}</span>
            </div>

            {showSpecs && (
              <div className="mt-6 border-t border-iteo-gray-100 pt-6">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-iteo-gray-500">Araç Özellikleri</h2>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {specRows.map((row) => (
                    <div key={row.label} className="rounded-lg bg-iteo-gray-50 px-4 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">{row.label}</dt>
                      <dd className="mt-1 text-sm font-bold text-iteo-black">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                {listing.damageInfo && (
                  <div className="mt-4 rounded-xl border border-iteo-gray-200 bg-iteo-gray-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-iteo-gray-500">Hasar & Durum</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-iteo-gray-700">{listing.damageInfo}</p>
                  </div>
                )}
              </div>
            )}

            {listing.description ? (
              <div className="mt-6 border-t border-iteo-gray-100 pt-6">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-iteo-gray-500">İlan Açıklaması</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-iteo-gray-700 sm:text-base">
                  {listing.description}
                </p>
              </div>
            ) : (
              !showSpecs && (
                <p className="mt-6 border-t border-iteo-gray-100 pt-6 text-sm text-iteo-gray-500">
                  Bu ilan için ek açıklama girilmemiş.
                </p>
              )
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-md">
              <div className="border-b border-iteo-gray-100 bg-iteo-gray-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">İlan Fiyatı</p>
                <p className="mt-1 text-3xl font-black tracking-tight text-iteo-black">{formatPrice(listing.price)}</p>
              </div>

              <div className="space-y-4 p-5">
                {showStatus && (
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge label={statusLabels[listing.status] ?? listing.status} tone={statusTone(listing.status)} />
                    {listing.isOwner && (
                      <StatusBadge label="İlanınız" tone="info" />
                    )}
                  </div>
                )}

                {listing.contactPhone ? (
                  <a
                    href={`tel:${listing.contactPhone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-iteo-yellow py-4 text-base font-bold text-iteo-black transition hover:bg-iteo-yellow/90"
                  >
                    <IteoIcon name="card" size={20} />
                    {listing.contactPhone}
                  </a>
                ) : (
                  <div className="rounded-xl border border-dashed border-iteo-gray-200 px-4 py-4 text-center text-sm text-iteo-gray-500">
                    Satıcı telefon bilgisi paylaşılmamış
                  </div>
                )}

                {listing.contactPhone && (
                  <p className="text-center text-xs text-iteo-gray-400">
                    Güvenli alışveriş için yüz yüze görüşmeyi tercih edin.
                  </p>
                )}
              </div>
            </div>

            {listing.adminNote && showStatus && (
              <div className="rounded-2xl border border-iteo-danger/30 bg-iteo-danger-light p-4 text-sm text-iteo-danger">
                <p className="font-bold">Oda değerlendirme notu</p>
                <p className="mt-2 leading-relaxed">{listing.adminNote}</p>
              </div>
            )}

            <div className="rounded-2xl border border-iteo-gray-200 bg-white p-4 text-sm text-iteo-gray-600 shadow-sm">
              <p className="font-semibold text-iteo-black">İTEO Pazar Yeri</p>
              <p className="mt-2 leading-relaxed">
                İlanlar oda onayından geçer. Şüpheli durumlarda odaya bildirin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
