'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { BookingCalendar } from '@/components/member/BookingCalendar';
import { DataTable } from '@/components/admin/AdminUi';
import { formatDisplayDate, SERVICE_TIME_SLOTS, SERVICE_TYPES } from '@/lib/date-utils';
import { IteoIcon } from '@/components/ui/icons';
import type { Appointment, Vehicle } from './appointment-shared';
import { statusLabels } from './appointment-shared';

interface Props {
  items: Appointment[];
  vehicles: Vehicle[];
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onReload: () => Promise<void>;
  onError: (message: string | null) => void;
}

export function ServiceAppointmentPanel({
  items,
  vehicles,
  saving,
  onSavingChange,
  onReload,
  onError,
}: Props) {
  const [serviceDate, setServiceDate] = useState<string | null>(null);
  const [serviceTime, setServiceTime] = useState('09:00');
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [vehicleId, setVehicleId] = useState(() => vehicles[0]?.id ?? '');
  const [serviceNotes, setServiceNotes] = useState('');

  const serviceItems = items.filter((a) => a.type === 'AUTO_SERVICE');
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  useEffect(() => {
    if (vehicles.length === 0) {
      setVehicleId('');
      return;
    }
    setVehicleId((current) =>
      vehicles.some((v) => v.id === current) ? current : vehicles[0].id,
    );
  }, [vehicles]);

  function resetForm() {
    setServiceDate(null);
    setServiceTime('09:00');
    setServiceType(SERVICE_TYPES[0]);
    setServiceNotes('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!serviceDate) {
      onError('Lütfen servis tarihini seçin.');
      return;
    }

    if (!selectedVehicle) {
      onError('Lütfen kayıtlı plakalarınızdan birini seçin.');
      return;
    }

    onSavingChange(true);
    onError(null);
    try {
      await api.post('/appointments', {
        type: 'AUTO_SERVICE',
        requestedDate: serviceDate,
        requestedTime: serviceTime,
        plateNumber: selectedVehicle.plateNumber,
        vehicleId: selectedVehicle.id,
        serviceType,
        description: serviceNotes.trim() || undefined,
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
            <h2 className="text-lg font-bold text-iteo-black">Servis günü</h2>
            <p className="mt-1 text-sm text-iteo-gray-500">Randevu tarihini takvimden seçin.</p>
          </div>

          <BookingCalendar mode="single" value={serviceDate} onChange={setServiceDate} />

          <div className="rounded-2xl border border-iteo-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-iteo-black">Saat seçin</p>
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

        <div className="space-y-4 rounded-2xl border border-iteo-gray-200 bg-white p-6 shadow-md">
          <h3 className="font-bold text-iteo-black">Servis detayları</h3>

          {serviceDate && (
            <div className="rounded-xl bg-iteo-gray-100 px-4 py-3 text-sm">
              <span className="text-iteo-gray-600">Seçilen randevu: </span>
              <span className="font-semibold text-iteo-black">
                {formatDisplayDate(serviceDate)} · {serviceTime}
              </span>
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">Servis türü</span>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5">
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">Plaka</span>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              disabled={vehicles.length === 0}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5 disabled:bg-iteo-gray-100 disabled:text-iteo-gray-400">
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
              <p className="flex items-center gap-1.5 text-xs text-iteo-gray-500">
                <IteoIcon name="taxi" size={14} />
                Servis randevusu için önce{' '}
                <Link href="/panel/vehicles" className="font-semibold text-iteo-yellow hover:underline">
                  Plakalarım
                </Link>{' '}
                menüsünden plaka ekleyin.
              </p>
            ) : (
              <p className="text-xs text-iteo-gray-500">
                Yeni plaka için{' '}
                <Link href="/panel/vehicles" className="font-semibold text-iteo-yellow hover:underline">
                  Plakalarım
                </Link>
              </p>
            )}
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">Not (isteğe bağlı)</span>
            <textarea
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
              rows={3}
              placeholder="Arıza veya ek bilgi"
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
          </label>

          <button
            type="submit"
            disabled={saving || !serviceDate || !vehicleId}
            className="w-full rounded-xl bg-iteo-yellow px-5 py-3.5 text-sm font-bold text-iteo-black disabled:opacity-60">
            {saving ? 'Randevu oluşturuluyor...' : 'Servis Randevusu Al'}
          </button>
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-lg font-bold text-iteo-black">Servis randevularım</h2>
        <DataTable
          columns={[
            { key: 'datetime', label: 'Tarih / Saat' },
            { key: 'plate', label: 'Plaka' },
            { key: 'service', label: 'Servis' },
            { key: 'statusLabel', label: 'Durum' },
          ]}
          rows={serviceItems.map((a) => ({
            datetime: `${formatDisplayDate(a.requestedDate.slice(0, 10))}${a.requestedTime ? ` · ${a.requestedTime}` : ''}`,
            plate: a.plateNumber ?? '—',
            service: a.serviceType ?? '—',
            statusLabel: statusLabels[a.status] ?? a.status,
          }))}
          emptyMessage="Henüz servis randevusu yok"
        />
      </div>

      {serviceItems.some((a) => a.status === 'PENDING') && (
        <div className="rounded-2xl border border-iteo-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-iteo-black">Bekleyen talepleri iptal et</p>
          <div className="flex flex-wrap gap-2">
            {serviceItems
              .filter((a) => a.status === 'PENDING')
              .map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => cancelAppointment(a.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                  {`${formatDisplayDate(a.requestedDate.slice(0, 10))} — İptal`}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
