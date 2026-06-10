'use client';

import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { DataTable, ErrorBlock, LoadingBlock, PageHeader, StatCard } from '@/components/admin/AdminUi';

interface RatingsAnalytics {
  overallAverage: number;
  totalCount: number;
  topDrivers: Array<{ driverId: string; average: number; count: number }>;
}

export default function RatingsPage() {
  const [analytics, setAnalytics] = useState<RatingsAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<RatingsAnalytics>>('/admin/ratings/analytics')
      .then((res) => setAnalytics(res.data ?? null))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Şoför Puanlama" description="QR puanlama analitiği" />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Genel Ortalama"
          value={analytics?.overallAverage ?? 0}
          hint="Tüm puanların ortalaması"
        />
        <StatCard
          label="Toplam Puan"
          value={analytics?.totalCount ?? 0}
          hint="Kayıtlı değerlendirme sayısı"
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-iteo-black">En Yüksek Puanlı Şoförler</h2>
        <DataTable
          columns={[
            { key: 'driverId', label: 'Şoför ID' },
            { key: 'average', label: 'Ortalama' },
            { key: 'count', label: 'Puan Sayısı' },
          ]}
          rows={(analytics?.topDrivers ?? []).map((d) => ({
            driverId: d.driverId,
            average: d.average,
            count: d.count,
          }))}
          emptyMessage="Henüz puan kaydı yok"
        />
      </div>
    </div>
  );
}
