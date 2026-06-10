'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock } from '@/components/admin/AdminUi';
import { StatusBadge } from '@/components/ui/DesignSystem';
import { IteoIcon } from '@/components/ui/icons';
import { ModulePageHero } from '@/components/member/ModulePageHero';
import { PlateSelectField } from '@/components/member/PlateSelectField';
import type { ServiceModuleConfig, ServiceRequest } from './service-request-shared';
import { inputClass, labelClass, statusLabels, statusTone } from './service-request-shared';

interface Props {
  config: ServiceModuleConfig;
}

export function ServiceRequestPanel({ config }: Props) {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [selectedPlate, setSelectedPlate] = useState('');
  const [locationAddress, setLocationAddress] = useState('');

  const load = useCallback(async () => {
    const res = await api.get<ApiResponse<ServiceRequest> & { items: ServiceRequest[] }>(
      `/service-requests?limit=50&type=${config.type}`,
    );
    setItems(res.items ?? []);
  }, [config.type]);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/service-requests', {
        type: config.type,
        title: title.trim(),
        description: description.trim() || undefined,
        plateNumber: config.fields.plate ? selectedPlate || undefined : undefined,
        vehicleId: config.fields.plate ? vehicleId || undefined : undefined,
        locationAddress: config.fields.location ? locationAddress.trim() || undefined : undefined,
      });
      setTitle('');
      setDescription('');
      setVehicleId('');
      setSelectedPlate('');
      setLocationAddress('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6 pb-10">
      <ModulePageHero badge={config.badge} title={config.title} description={config.description} />

      {error && <ErrorBlock message={error} />}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-iteo-gray-200 bg-white p-5 shadow-sm sm:p-6 space-y-4"
      >
        <div className="flex items-start gap-3 border-b border-iteo-gray-100 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-iteo-yellow">
            <IteoIcon name={config.icon} size={22} className="text-iteo-black" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-iteo-black">{config.formTitle}</h2>
            <p className="mt-1 text-sm text-iteo-gray-500">Talebiniz oda ekibine iletilir ve durumu buradan takip edilir.</p>
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className={labelClass}>Başlık *</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Kısa özet"
            required
            maxLength={200}
            className={inputClass}
          />
        </label>

        <label className="block space-y-1.5">
          <span className={labelClass}>Açıklama</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detaylı bilgi (isteğe bağlı)"
            rows={4}
            maxLength={2000}
            className={inputClass}
          />
        </label>

        {config.fields.plate && (
          <PlateSelectField
            value={vehicleId}
            onChange={(id, vehicle) => {
              setVehicleId(id);
              setSelectedPlate(vehicle?.plateNumber ?? '');
            }}
          />
        )}

        {config.fields.location && (
          <label className="block space-y-1.5">
            <span className={labelClass}>Konum Adresi</span>
            <input
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="Bulunduğunuz adres veya konum"
              maxLength={500}
              className={inputClass}
            />
          </label>
        )}

        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="rounded-xl bg-iteo-yellow px-6 py-3 text-sm font-bold text-iteo-black transition hover:bg-iteo-yellow/90 disabled:opacity-60"
        >
          {saving ? 'Gönderiliyor...' : 'Talep Gönder'}
        </button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-iteo-black">Taleplerim</h2>
          <span className="text-xs font-semibold text-iteo-gray-500">{items.length} kayıt</span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-iteo-gray-200 bg-white p-10 text-center text-sm text-iteo-gray-500">
            Bu modülde henüz talebiniz yok.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-iteo-gray-200 bg-white p-4 shadow-sm transition hover:border-iteo-yellow/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-iteo-black">{item.title}</p>
                  <StatusBadge label={statusLabels[item.status] ?? item.status} tone={statusTone(item.status)} />
                </div>
                {item.description && (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-iteo-gray-600">{item.description}</p>
                )}
                <div className="mt-3 space-y-1 text-xs text-iteo-gray-500">
                  {item.plateNumber && <p>Plaka: {item.plateNumber}</p>}
                  {item.locationAddress && <p>Konum: {item.locationAddress}</p>}
                  {item.adminNote && <p className="text-iteo-danger">Oda notu: {item.adminNote}</p>}
                  <p>{new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
