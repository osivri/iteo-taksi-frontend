'use client';

import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { DataTable, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface VehicleRow {
  id: string;
  plateNumber: string;
  brand: string | null;
  model: string | null;
  status: string;
}

export default function VehiclesPage() {
  const [rows, setRows] = useState<VehicleRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<VehicleRow> & { data: VehicleRow[] }>('/vehicles')
      .then((res) => setRows((res as { data: VehicleRow[] }).data ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div>
      <PageHeader title="Plaka / Araç" description="Kayıtlı araç ve plaka listesi" />
      <DataTable
        columns={[
          { key: 'plateNumber', label: 'Plaka' },
          { key: 'brand', label: 'Marka' },
          { key: 'model', label: 'Model' },
          { key: 'status', label: 'Durum' },
        ]}
        rows={rows.map((r) => ({ ...r, brand: r.brand ?? '—', model: r.model ?? '—' }))}
      />
    </div>
  );
}
