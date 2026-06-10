'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiResponse } from '@/lib/api/client';
import {
  ActionCard,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  SectionCard,
  StatCard,
} from '@/components/admin/AdminUi';

interface DashboardStats {
  totalUsers: number;
  totalVehicles: number;
  pendingAppointments: number;
  monthlyRevenue: number;
  currency: string;
  publishedAnnouncements: number;
  publishedNews: number;
}

interface DashboardReports {
  pendingVerifications?: number;
  paymentsThisMonth?: {
    success: number;
    failed: number;
    revenue: number;
    currency: string;
  };
  appointmentsByStatus?: Record<string, number>;
}

interface PendingTask {
  title: string;
  count: number;
  href: string;
  tone?: 'default' | 'warning' | 'danger';
}

const quickActions = [
  { title: 'Duyuru Yayınla', desc: 'Üyelere anlık duyuru gönder', href: '/dashboard/announcements', icon: 'megaphone' as const },
  { title: 'Bildirim Gönder', desc: 'Rol veya kullanıcı bazlı bildirim', href: '/dashboard/notifications', icon: 'bell' as const },
  { title: 'Kullanıcı Ara', desc: 'Doğrulama ve profil yönetimi', href: '/dashboard/users', icon: 'users' as const },
  { title: 'Randevu Yönet', desc: 'Bekleyen randevuları onayla', href: '/dashboard/appointments', icon: 'calendar' as const },
  { title: 'Hatırlatmalar', desc: 'Aidat ve randevu hatırlatmaları', href: '/dashboard/reminders', icon: 'clock' as const },
  { title: 'Ödeme Takibi', desc: 'Aidat ve uygulama ücretleri', href: '/dashboard/payments', icon: 'card' as const },
];

export default function DashboardPageClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<DashboardReports | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats'),
      api.get<ApiResponse<DashboardReports>>('/admin/dashboard/reports'),
    ])
      .then(([statsRes, reportsRes]) => {
        setStats(statsRes.data ?? null);
        setReports(reportsRes.data ?? null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!stats) return <ErrorBlock message="Veri alınamadı" />;

  const openServiceRequests = reports?.appointmentsByStatus?.PENDING ?? 0;
  const pendingTasks = (
    [
      {
        title: 'Bekleyen doğrulama',
        count: reports?.pendingVerifications ?? 0,
        href: '/dashboard/users',
        tone: 'warning' as const,
      },
      {
        title: 'Bekleyen randevu',
        count: stats.pendingAppointments,
        href: '/dashboard/appointments',
        tone: 'warning' as const,
      },
      {
        title: 'Başarısız ödeme (bu ay)',
        count: reports?.paymentsThisMonth?.failed ?? 0,
        href: '/dashboard/payments',
        tone: 'danger' as const,
      },
      {
        title: 'Açık hizmet talebi',
        count: openServiceRequests,
        href: '/dashboard/service-requests',
      },
    ] satisfies PendingTask[]
  ).filter((t) => t.count > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operasyon Kokpiti"
        description="Bekleyen işleri görün, hızlı aksiyon alın."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Bekleyen Doğrulama"
          value={reports?.pendingVerifications ?? 0}
          tone={(reports?.pendingVerifications ?? 0) > 0 ? 'warning' : 'default'}
          href="/dashboard/users"
        />
        <StatCard
          label="Bekleyen Randevu"
          value={stats.pendingAppointments}
          tone={stats.pendingAppointments > 0 ? 'warning' : 'default'}
          href="/dashboard/appointments"
        />
        <StatCard
          label="Bugünkü Tahsilat (Ay)"
          value={`${stats.monthlyRevenue.toLocaleString('tr-TR')} ${stats.currency}`}
          hint={`${reports?.paymentsThisMonth?.success ?? 0} başarılı ödeme`}
          href="/dashboard/payments"
        />
        <StatCard label="Toplam Üye" value={stats.totalUsers} href="/dashboard/users" />
        <StatCard label="Aktif Plaka" value={stats.totalVehicles} href="/dashboard/vehicles" />
        <StatCard
          label="Yayındaki İçerik"
          value={stats.publishedAnnouncements + stats.publishedNews}
          hint={`${stats.publishedAnnouncements} duyuru · ${stats.publishedNews} haber`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Bekleyen İşler"
          description="Öncelikli operasyon kalemleri"
          className="xl:col-span-2"
        >
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-iteo-gray-500">Bekleyen kritik iş yok. Tüm operasyonlar güncel görünüyor.</p>
          ) : (
            <ul className="divide-y divide-iteo-gray-100">
              {pendingTasks.map((task) => (
                <li key={task.title}>
                  <Link
                    href={task.href}
                    className="flex items-center justify-between py-3 transition hover:text-iteo-yellow-dark"
                  >
                    <span className="font-medium text-iteo-black">{task.title}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        task.tone === 'danger'
                          ? 'bg-iteo-danger-light text-iteo-danger'
                          : task.tone === 'warning'
                            ? 'bg-iteo-warning-light text-iteo-warning'
                            : 'bg-iteo-gray-100 text-iteo-black'
                      }`}
                    >
                      {task.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Hızlı Aksiyonlar">
          <div className="space-y-3">
            {quickActions.slice(0, 4).map((action) => (
              <ActionCard
                key={action.href}
                href={action.href}
                icon={action.icon}
                title={action.title}
                description={action.desc}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Tüm Hızlı İşlemler">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <ActionCard
              key={action.title}
              href={action.href}
              icon={action.icon}
              title={action.title}
              description={action.desc}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Son Aktivite"
        description="Detaylı işlem geçmişi için audit log sayfasını kullanın"
        action={
          <Link href="/dashboard/audit-logs" className="text-sm font-semibold text-iteo-yellow-dark hover:underline">
            Tüm loglar →
          </Link>
        }
      >
        <p className="text-sm text-iteo-gray-500">
          Sistemdeki son admin işlemlerini İşlem Logları ekranından inceleyebilirsiniz.
        </p>
      </SectionCard>
    </div>
  );
}
