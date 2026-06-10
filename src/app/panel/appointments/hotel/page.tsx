'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock } from '@/components/admin/AdminUi';
import { HotelAppointmentPanel } from '@/components/member/appointments/HotelAppointmentPanel';
import type { Appointment } from '@/components/member/appointments/appointment-shared';
import { ModulePageHero } from '@/components/member/ModulePageHero';

export default function PanelHotelAppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<ApiResponse<Appointment> & { items: Appointment[] }>(
      '/appointments?limit=30&type=HOTEL',
    );
    setItems(res.items ?? []);
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6 pb-10">
      <ModulePageHero
        badge="Otel Konaklama"
        title="Otel Rezervasyonu"
        description="Oda üyesi otel konaklama taleplerinizi tarih aralığı seçerek oluşturun ve takip edin."
        decoration={
          <svg
            className="pointer-events-none absolute bottom-2 right-6 h-28 w-32 text-iteo-yellow/10"
            viewBox="0 0 200 160"
            fill="currentColor"
            aria-hidden
          >
            <rect x="40" y="48" width="120" height="96" rx="8" />
            <rect x="64" y="72" width="24" height="24" rx="2" />
            <rect x="112" y="72" width="24" height="24" rx="2" />
            <rect x="88" y="120" width="24" height="24" rx="2" />
          </svg>
        }
      />

      {error && <ErrorBlock message={error} />}

      <HotelAppointmentPanel
        items={items}
        saving={saving}
        onSavingChange={setSaving}
        onReload={load}
        onError={setError}
      />
    </div>
  );
}
