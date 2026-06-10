'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api/client';
import { BookingCalendar, nightsBetween } from '@/components/member/BookingCalendar';
import { DataTable } from '@/components/admin/AdminUi';
import { formatDisplayDate, HOTEL_ROOM_TYPES } from '@/lib/date-utils';
import type { Appointment } from './appointment-shared';
import { statusLabels } from './appointment-shared';

interface Props {
  items: Appointment[];
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onReload: () => Promise<void>;
  onError: (message: string | null) => void;
}

export function HotelAppointmentPanel({ items, saving, onSavingChange, onReload, onError }: Props) {
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [roomType, setRoomType] = useState('STANDARD');
  const [hotelNotes, setHotelNotes] = useState('');

  const hotelItems = items.filter((a) => a.type === 'HOTEL');
  const hotelNights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  function resetForm() {
    setCheckIn(null);
    setCheckOut(null);
    setGuestCount(2);
    setRoomType('STANDARD');
    setHotelNotes('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      onError('Lütfen giriş ve çıkış tarihlerini seçin.');
      return;
    }

    onSavingChange(true);
    onError(null);
    try {
      await api.post('/appointments', {
        type: 'HOTEL',
        requestedDate: checkIn,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount,
        roomType,
        description: hotelNotes.trim() || undefined,
      });
      resetForm();
      await onReload();
    } catch (err) {
      onError((err as Error).message);
    } finally {
      onSavingChange(false);
    }
  }

  async function cancelAppointment(id: string) {
    try {
      await api.patch(`/appointments/${id}/cancel`, {});
      await onReload();
    } catch (err) {
      onError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-iteo-black">Konaklama tarihleri</h2>
            <p className="mt-1 text-sm text-iteo-gray-500">Giriş ve çıkış tarihlerinizi takvimden seçin.</p>
          </div>

          <BookingCalendar
            mode="range"
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(inDate, outDate) => {
              setCheckIn(inDate);
              setCheckOut(outDate);
            }}
          />

          <div className="rounded-2xl border border-iteo-gray-200 bg-white p-4 text-sm shadow-sm">
            <p className="font-semibold text-iteo-black">Seçilen tarihler</p>
            <p className="mt-2 text-iteo-gray-600">Giriş: {checkIn ? formatDisplayDate(checkIn) : '—'}</p>
            <p className="text-iteo-gray-600">Çıkış: {checkOut ? formatDisplayDate(checkOut) : '—'}</p>
            {hotelNights > 0 && (
              <p className="mt-2 font-bold text-iteo-yellow">{hotelNights} gece konaklama</p>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-iteo-gray-200 bg-white p-6 shadow-md">
          <h3 className="font-bold text-iteo-black">Rezervasyon detayları</h3>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">Oda tipi</span>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5">
              {HOTEL_ROOM_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">Misafir sayısı</span>
            <input
              type="number"
              min={1}
              max={6}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">Not (isteğe bağlı)</span>
            <textarea
              value={hotelNotes}
              onChange={(e) => setHotelNotes(e.target.value)}
              rows={3}
              placeholder="Erken giriş, ek yatak vb."
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
          </label>

          <button
            type="submit"
            disabled={saving || !checkIn || !checkOut}
            className="w-full rounded-xl bg-iteo-yellow px-5 py-3.5 text-sm font-bold text-iteo-black disabled:opacity-60">
            {saving ? 'Rezervasyon oluşturuluyor...' : 'Rezervasyon Talebi Gönder'}
          </button>
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-lg font-bold text-iteo-black">Otel rezervasyonlarım</h2>
        <DataTable
          columns={[
            { key: 'dates', label: 'Konaklama' },
            { key: 'room', label: 'Oda' },
            { key: 'guests', label: 'Misafir' },
            { key: 'statusLabel', label: 'Durum' },
          ]}
          rows={hotelItems.map((a) => ({
            dates:
              a.checkInDate && a.checkOutDate
                ? `${formatDisplayDate(a.checkInDate)} → ${formatDisplayDate(a.checkOutDate)}`
                : formatDisplayDate(a.requestedDate.slice(0, 10)),
            room: a.roomType ?? '—',
            guests: a.guestCount ?? '—',
            statusLabel: statusLabels[a.status] ?? a.status,
          }))}
          emptyMessage="Henüz otel rezervasyonu yok"
        />
      </div>

      {hotelItems.some((a) => a.status === 'PENDING') && (
        <div className="rounded-2xl border border-iteo-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-iteo-black">Bekleyen talepleri iptal et</p>
          <div className="flex flex-wrap gap-2">
            {hotelItems
              .filter((a) => a.status === 'PENDING')
              .map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => cancelAppointment(a.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                  {a.checkInDate
                    ? `${formatDisplayDate(a.checkInDate)} — İptal`
                    : `${formatDisplayDate(a.requestedDate.slice(0, 10))} — İptal`}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
