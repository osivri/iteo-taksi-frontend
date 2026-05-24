'use client';

import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader, StatCard } from '@/components/admin/AdminUi';

interface ReportsData {
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
  appointmentsByType: Record<string, number>;
  appointmentsByStatus: Record<string, number>;
  paymentsThisMonth: {
    total: number;
    success: number;
    failed: number;
    revenue: number;
    currency: string;
  };
  financeThisMonth: {
    income: number;
    expense: number;
    net: number;
    currency: string;
  };
  pendingVerifications: number;
  generatedAt: string;
}

const roleLabels: Record<string, string> = {
  USER: 'Üye',
  DRIVER: 'Şoför',
  PLATE_OWNER: 'Plaka Sahibi',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Süper Admin',
};

function MapTable({ title, data, labels }: { title: string; data: Record<string, number>; labels?: Record<string, string> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-iteo-gray-200 bg-white p-5">
        <h3 className="font-semibold text-iteo-black">{title}</h3>
        <p className="mt-2 text-sm text-iteo-gray-500">Veri yok</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-iteo-gray-200 bg-white p-5">
      <h3 className="mb-4 font-semibold text-iteo-black">{title}</h3>
      <div className="space-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-iteo-gray-600">{labels?.[key] ?? key}</span>
            <span className="font-semibold text-iteo-black">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<ReportsData>>('/admin/dashboard/reports')
      .then((res) => setData(res.data ?? null))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!data) return <ErrorBlock message="Rapor verisi alınamadı" />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Raporlar"
        description={`Operasyon özeti — ${new Date(data.generatedAt).toLocaleString('tr-TR')}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Doğrulama Bekleyen" value={data.pendingVerifications} />
        <StatCard
          label="Bu Ay Tahsilat"
          value={`${data.paymentsThisMonth.revenue.toLocaleString('tr-TR')} ${data.paymentsThisMonth.currency}`}
        />
        <StatCard
          label="Başarılı Ödeme"
          value={`${data.paymentsThisMonth.success} / ${data.paymentsThisMonth.total}`}
        />
        <StatCard
          label="Üye Net Muhasebe"
          value={`${data.financeThisMonth.net.toLocaleString('tr-TR')} ${data.financeThisMonth.currency}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MapTable title="Kullanıcılar — Rol" data={data.usersByRole} labels={roleLabels} />
        <MapTable title="Kullanıcılar — Durum" data={data.usersByStatus} />
        <MapTable title="Randevular — Tip" data={data.appointmentsByType} />
        <MapTable title="Randevular — Durum" data={data.appointmentsByStatus} />
      </div>

      <div className="rounded-xl border border-iteo-gray-200 bg-white p-5">
        <h3 className="mb-4 font-semibold text-iteo-black">Bu Ay Muhasebe Özeti (Üye Kayıtları)</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Toplam Gelir"
            value={`${data.financeThisMonth.income.toLocaleString('tr-TR')} ${data.financeThisMonth.currency}`}
          />
          <StatCard
            label="Toplam Gider"
            value={`${data.financeThisMonth.expense.toLocaleString('tr-TR')} ${data.financeThisMonth.currency}`}
          />
          <StatCard
            label="Net"
            value={`${data.financeThisMonth.net.toLocaleString('tr-TR')} ${data.financeThisMonth.currency}`}
          />
        </div>
      </div>
    </div>
  );
}
