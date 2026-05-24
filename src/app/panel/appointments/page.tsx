'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiResponse } from '@/lib/api/client';
import { BookingCalendar, nightsBetween } from '@/components/member/BookingCalendar';
import { DataTable, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';
import {
  formatDisplayDate,
  HOTEL_ROOM_TYPES,
  SERVICE_TIME_SLOTS,
  SERVICE_TYPES,
} from '@/lib/date-utils';

interface Appointment {
  id: string;
  type: string;
  status: string;
  requestedDate: string;
  requestedTime: string | null;
  description: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  guestCount: number | null;
  roomType: string | null;
  plateNumber: string | null;
  serviceType: string | null;
}

interface Vehicle {
  id: string;
  plateNumber: string;
}

type TabType = 'HOTEL' | 'AUTO_SERVICE';

const typeLabels: Record<string, string> = {
  HOTEL: 'Otel',
  AUTO_SERVICE: 'Oto Servis',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

export default function PanelAppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tab, setTab] = useState<TabType>('HOTEL');

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [roomType, setRoomType] = useState('STANDARD');
  const [hotelNotes, setHotelNotes] = useState('');

  const [serviceDate, setServiceDate] = useState<string | null>(null);
  const [serviceTime, setServiceTime] = useState('09:00');
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [vehicleId, setVehicleId] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [appointmentsRes, vehiclesRes] = await Promise.all([
      api.get<ApiResponse<Appointment> & { items: Appointment[] }>('/appointments?limit=30'),
      api.get<ApiResponse<Vehicle[]>>('/vehicles').catch(() => ({ data: [] as Vehicle[] })),
    ]);
    setItems(appointmentsRes.items ?? []);
    const v = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
    setVehicles(v);
  }, []);

  useEffect(() => {
    if (vehicles.length === 0) {
      setVehicleId('');
      return;
    }
    setVehicleId((current) =>
      vehicles.some((v) => v.id === current) ? current : vehicles[0].id,
    );
  }, [vehicles]);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  function resetHotelForm() {
    setCheckIn(null);
    setCheckOut(null);
    setGuestCount(2);
    setRoomType('STANDARD');
    setHotelNotes('');
  }

  function resetServiceForm() {
    setServiceDate(null);
    setServiceTime('09:00');
    setServiceType(SERVICE_TYPES[0]);
    setServiceNotes('');
  }

  async function handleHotelSubmit(e: FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError('Lütfen giriş ve çıkış tarihlerini seçin.');
      return;
    }

    setSaving(true);
    setError(null);
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
      resetHotelForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleServiceSubmit(e: FormEvent) {
    e.preventDefault();
    if (!serviceDate) {
      setError('Lütfen servis tarihini seçin.');
      return;
    }

    const selected = vehicles.find((v) => v.id === vehicleId);
    if (!selected) {
      setError('Lütfen kayıtlı plakalarınızdan birini seçin.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.post('/appointments', {
        type: 'AUTO_SERVICE',
        requestedDate: serviceDate,
        requestedTime: serviceTime,
        plateNumber: selected.plateNumber,
        vehicleId: selected.id,
        serviceType,
        description: serviceNotes.trim() || undefined,
      });
      resetServiceForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function cancelAppointment(id: string) {
    try {
      await api.patch(`/appointments/${id}/cancel`, {});
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const filteredItems = items.filter((a) => a.type === tab);
  const hotelNights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Randevu"
        description="Otel konaklama ve oto servis randevularınızı takvimden planlayın."
      />

      {error && <ErrorBlock message={error} />}

      <div className="flex gap-2">
        {(['HOTEL', 'AUTO_SERVICE'] as TabType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setError(null);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t ? 'bg-iteo-yellow text-iteo-black' : 'bg-white text-iteo-gray-600 border border-iteo-gray-200'
            }`}>
            {typeLabels[t]}
          </button>
        ))}
      </div>

      {tab === 'HOTEL' ? (
        <form onSubmit={handleHotelSubmit} className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-iteo-black">Otel Rezervasyonu</h2>
              <p className="mt-1 text-sm text-iteo-gray-500">
                Giriş ve çıkış tarihlerinizi takvimden seçin.
              </p>
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

            <div className="rounded-xl border border-iteo-gray-200 bg-white p-4 text-sm">
              <p className="font-medium text-iteo-black">Seçilen tarihler</p>
              <p className="mt-2 text-iteo-gray-600">
                Giriş: {checkIn ? formatDisplayDate(checkIn) : '—'}
              </p>
              <p className="text-iteo-gray-600">
                Çıkış: {checkOut ? formatDisplayDate(checkOut) : '—'}
              </p>
              {hotelNights > 0 && (
                <p className="mt-2 font-semibold text-iteo-yellow">{hotelNights} gece konaklama</p>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-iteo-gray-200 bg-white p-6">
            <h3 className="font-semibold text-iteo-black">Rezervasyon Detayları</h3>

            <label className="block space-y-1">
              <span className="text-sm text-iteo-gray-600">Oda tipi</span>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5">
                {HOTEL_ROOM_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-iteo-gray-600">Misafir sayısı</span>
              <input
                type="number"
                min={1}
                max={6}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-iteo-gray-600">Not (isteğe bağlı)</span>
              <textarea
                value={hotelNotes}
                onChange={(e) => setHotelNotes(e.target.value)}
                rows={3}
                placeholder="Erken giriş, ek yatak vb."
                className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
              />
            </label>

            <button
              type="submit"
              disabled={saving || !checkIn || !checkOut}
              className="w-full rounded-lg bg-iteo-yellow px-5 py-3 text-sm font-semibold text-iteo-black disabled:opacity-60">
              {saving ? 'Rezervasyon oluşturuluyor...' : 'Rezervasyon Talebi Gönder'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleServiceSubmit} className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-iteo-black">Servis Randevusu</h2>
              <p className="mt-1 text-sm text-iteo-gray-500">Servis gününü takvimden seçin.</p>
            </div>

            <BookingCalendar mode="single" value={serviceDate} onChange={setServiceDate} />

            <div className="rounded-xl border border-iteo-gray-200 bg-white p-4">
              <p className="mb-3 text-sm font-medium text-iteo-black">Saat seçin</p>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setServiceTime(slot)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      serviceTime === slot
                        ? 'bg-iteo-yellow text-iteo-black'
                        : 'border border-iteo-gray-200 bg-white text-iteo-gray-600 hover:border-iteo-yellow/50'
                    }`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-iteo-gray-200 bg-white p-6">
            <h3 className="font-semibold text-iteo-black">Servis Detayları</h3>

            {serviceDate && (
              <div className="rounded-lg bg-iteo-gray-100 px-4 py-3 text-sm">
                <span className="text-iteo-gray-600">Seçilen randevu: </span>
                <span className="font-semibold text-iteo-black">
                  {formatDisplayDate(serviceDate)} · {serviceTime}
                </span>
              </div>
            )}

            <label className="block space-y-1">
              <span className="text-sm text-iteo-gray-600">Servis türü</span>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5">
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-iteo-gray-600">Plaka</span>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={vehicles.length === 0}
                className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5 disabled:bg-iteo-gray-100 disabled:text-iteo-gray-400">
                {vehicles.length === 0 ? (
                  <option value="">Kayıtlı plaka yok</option>
                ) : (
                  vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber}
                    </option>
                  ))
                )}
              </select>
              {vehicles.length === 0 ? (
                <p className="text-xs text-iteo-gray-500">
                  Servis randevusu için önce{' '}
                  <Link href="/panel/vehicles" className="font-medium text-iteo-yellow hover:underline">
                    Plakalarım
                  </Link>{' '}
                  menüsünden plakanızı ekleyin.
                </p>
              ) : (
                <p className="text-xs text-iteo-gray-500">
                  Kayıtlı plakalarınızdan birini seçin. Yeni plaka eklemek için{' '}
                  <Link href="/panel/vehicles" className="font-medium text-iteo-yellow hover:underline">
                    Plakalarım
                  </Link>
                  .
                </p>
              )}
            </label>

            <label className="block space-y-1">
              <span className="text-sm text-iteo-gray-600">Not (isteğe bağlı)</span>
              <textarea
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                rows={3}
                placeholder="Arıza veya ek bilgi"
                className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
              />
            </label>

            <button
              type="submit"
              disabled={saving || !serviceDate || !vehicleId}
              className="w-full rounded-lg bg-iteo-yellow px-5 py-3 text-sm font-semibold text-iteo-black disabled:opacity-60">
              {saving ? 'Randevu oluşturuluyor...' : 'Servis Randevusu Al'}
            </button>
          </div>
        </form>
      )}

      <div>
        <h2 className="mb-3 text-lg font-bold text-iteo-black">
          {tab === 'HOTEL' ? 'Otel Rezervasyonlarım' : 'Servis Randevularım'}
        </h2>
        <DataTable
          columns={
            tab === 'HOTEL'
              ? [
                  { key: 'dates', label: 'Konaklama' },
                  { key: 'room', label: 'Oda' },
                  { key: 'guests', label: 'Misafir' },
                  { key: 'statusLabel', label: 'Durum' },
                ]
              : [
                  { key: 'datetime', label: 'Tarih / Saat' },
                  { key: 'plate', label: 'Plaka' },
                  { key: 'service', label: 'Servis' },
                  { key: 'statusLabel', label: 'Durum' },
                ]
          }
          rows={
            tab === 'HOTEL'
              ? filteredItems.map((a) => ({
                  dates:
                    a.checkInDate && a.checkOutDate
                      ? `${formatDisplayDate(a.checkInDate)} → ${formatDisplayDate(a.checkOutDate)}`
                      : formatDisplayDate(a.requestedDate.slice(0, 10)),
                  room: a.roomType ?? '—',
                  guests: a.guestCount ?? '—',
                  statusLabel: statusLabels[a.status] ?? a.status,
                }))
              : filteredItems.map((a) => ({
                  datetime: `${formatDisplayDate(a.requestedDate.slice(0, 10))}${a.requestedTime ? ` · ${a.requestedTime}` : ''}`,
                  plate: a.plateNumber ?? '—',
                  service: a.serviceType ?? '—',
                  statusLabel: statusLabels[a.status] ?? a.status,
                }))
          }
          emptyMessage="Henüz randevu talebi yok"
        />
      </div>

      {filteredItems.some((a) => a.status === 'PENDING') && (
        <div className="rounded-xl border border-iteo-gray-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-iteo-black">Bekleyen talepleri iptal et</p>
          <div className="flex flex-wrap gap-2">
            {filteredItems
              .filter((a) => a.status === 'PENDING')
              .map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => cancelAppointment(a.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                  {tab === 'HOTEL' && a.checkInDate
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
