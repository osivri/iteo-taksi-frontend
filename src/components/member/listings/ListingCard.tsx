'use client';

import Image from 'next/image';
import { IteoIcon } from '@/components/ui/icons';
import type { Listing } from './listings-shared';
import { formatDate, formatLocation, formatPrice, formatVehicleSummary, typeLabels } from './listings-shared';

interface Props {
  listing: Listing;
  onClick: () => void;
  variant?: 'grid' | 'list';
}

export function ListingCard({ listing, onClick, variant = 'grid' }: Props) {
  const photo = listing.photos?.[0];
  const isRental = listing.type === 'VEHICLE_RENTAL';
  const vehicleSummary = formatVehicleSummary(listing);

  if (variant === 'list') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full gap-4 rounded-xl border border-iteo-gray-200 bg-white p-3 text-left shadow-sm transition hover:border-iteo-yellow/60 hover:shadow-md sm:p-4"
      >
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-iteo-gray-100 sm:h-28 sm:w-40">
          {photo ? (
            <Image src={photo} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center ${
                isRental ? 'bg-gradient-to-br from-iteo-yellow/25 to-iteo-gray-100' : 'bg-gradient-to-br from-iteo-black/10 to-iteo-gray-100'
              }`}
            >
              <IteoIcon name={isRental ? 'taxi' : 'pin'} size={32} className="text-iteo-gray-400" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-bold text-iteo-black group-hover:text-iteo-yellow-dark">{listing.title}</p>
          {vehicleSummary && <p className="mt-1 text-xs font-medium text-iteo-gray-500">{vehicleSummary}</p>}
          <p className="mt-2 text-xl font-black text-iteo-black">{formatPrice(listing.price)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-iteo-gray-500">
            <span className="rounded bg-iteo-gray-100 px-2 py-0.5 font-semibold text-iteo-gray-700">
              {typeLabels[listing.type] ?? listing.type}
            </span>
            <span className="inline-flex items-center gap-1">
              <IteoIcon name="pin" size={12} />
              {formatLocation(listing)}
            </span>
            <span>{formatDate(listing.createdAt)}</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-iteo-gray-200 bg-white text-left shadow-sm transition hover:border-iteo-yellow/60 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full bg-iteo-gray-100">
        {photo ? (
          <Image src={photo} alt="" fill className="object-cover transition duration-300 group-hover:scale-[1.02]" unoptimized />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center ${
              isRental ? 'bg-gradient-to-br from-iteo-yellow/20 via-white to-iteo-gray-50' : 'bg-gradient-to-br from-iteo-black/5 via-white to-iteo-gray-50'
            }`}
          >
            <IteoIcon name={isRental ? 'taxi' : 'pin'} size={48} className="text-iteo-gray-300" />
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-md bg-iteo-black/75 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-iteo-yellow backdrop-blur">
          {typeLabels[listing.type] ?? listing.type}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-iteo-black group-hover:text-iteo-yellow-dark">
          {listing.title}
        </p>
        {vehicleSummary && <p className="mt-1 line-clamp-1 text-xs font-medium text-iteo-gray-500">{vehicleSummary}</p>}
        <p className="mt-2 text-xl font-black tracking-tight text-iteo-black">{formatPrice(listing.price)}</p>
        <p className="mt-auto flex items-center gap-1 pt-3 text-xs text-iteo-gray-500">
          <IteoIcon name="pin" size={12} />
          <span className="truncate">{formatLocation(listing)}</span>
        </p>
        <p className="mt-1 text-[11px] text-iteo-gray-400">{formatDate(listing.createdAt)}</p>
      </div>
    </button>
  );
}
