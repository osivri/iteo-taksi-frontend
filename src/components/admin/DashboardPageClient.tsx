'use client';

import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader, StatCard } from '@/components/admin/AdminUi';

interface DashboardStats {
  totalUsers: number;
  totalVehicles: number;
  pendingAppointments: number;
  monthlyRevenue: number;
  currency: string;
  publishedAnnouncements: number;
  publishedNews: number;
}

const quickActions = [
  { title: 'Duyuru Yayınla', desc: 'Üyelere anlık duyuru gönder', href: '/dashboard/announcements' },
  { title: 'Haber Ekle', desc: 'İTEO haberleri ve sektörel gelişmeler', href: '/dashboard/news' },
  { title: 'Randevu Yönet', desc: 'Otel ve oto servis talepleri', href: '/dashboard/appointments' },
  { title: 'Ödeme Takibi', desc: 'Aidat ve uygulama ücretleri', href: '/dashboard/payments' },
];

export default function DashboardPageClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<DashboardStats>>('/admin/dashboard/stats')
      .then((res) => setStats(res.data ?? null))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!stats) return <ErrorBlock message="Veri alınamadı" />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="İTEO operasyon özetine hoş geldiniz."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam Üye" value={stats.totalUsers} />
        <StatCard label="Aktif Plaka" value={stats.totalVehicles} />
        <StatCard label="Bekleyen Randevu" value={stats.pendingAppointments} />
        <StatCard
          label="Bu Ay Tahsilat"
          value={`${stats.monthlyRevenue.toLocaleString('tr-TR')} ${stats.currency}`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Yayındaki Duyuru" value={stats.publishedAnnouncements} />
        <StatCard label="Yayındaki Haber" value={stats.publishedNews} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-iteo-black">Hızlı İşlemler</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickActions.map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="group rounded-xl border border-iteo-gray-200 bg-white p-5 transition-all hover:border-iteo-yellow hover:shadow-md"
            >
              <h3 className="font-semibold text-iteo-black">{action.title}</h3>
              <p className="mt-1 text-sm text-iteo-gray-500">{action.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
