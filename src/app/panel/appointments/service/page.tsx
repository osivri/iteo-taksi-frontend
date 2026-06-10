'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock } from '@/components/admin/AdminUi';
import { ServiceAppointmentPanel } from '@/components/member/appointments/ServiceAppointmentPanel';
import type { Appointment, Vehicle } from '@/components/member/appointments/appointment-shared';
import { ModulePageHero } from '@/components/member/ModulePageHero';
import { parseApiItems } from '@/lib/parse-api-list';

export default function PanelServiceAppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [appointmentsRes, vehiclesRes] = await Promise.all([
      api.get<ApiResponse<Appointment> & { items: Appointment[] }>(
        '/appointments?limit=30&type=AUTO_SERVICE',
      ),
      api.get<ApiResponse<Vehicle[]>>('/vehicles?limit=100').catch(() => ({ data: [] as Vehicle[] })),
    ]);
    setItems(appointmentsRes.items ?? []);
    setVehicles(parseApiItems<Vehicle>(vehiclesRes));
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
        badge="Oto Servis"
        title="Servis Randevusu"
        description="Aracınız için bakım ve onarım randevusu alın; plaka ve saat seçerek talep oluşturun."
        decoration={
          <svg
            className="pointer-events-none absolute bottom-4 right-8 h-24 w-32 text-iteo-yellow/10"
            viewBox="0 0 200 120"
            fill="currentColor"
            aria-hidden
          >
            <path d="M48 88 L152 88 L140 52 H60 Z" />
            <circle cx="72" cy="96" r="12" />
            <circle cx="128" cy="96" r="12" />
            <rect x="88" y="64" width="24" height="8" rx="2" />
          </svg>
        }
      />

      {error && <ErrorBlock message={error} />}

      <ServiceAppointmentPanel
        items={items}
        vehicles={vehicles}
        saving={saving}
        onSavingChange={setSaving}
        onReload={load}
        onError={setError}
      />
    </div>
  );
}
