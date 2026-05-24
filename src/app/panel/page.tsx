'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader, StatCard } from '@/components/admin/AdminUi';
import { fetchCurrentProfile } from '@/lib/member-profile';
import { memberNavItems, getMemberNavLabel, roleDashboardTitles, type MemberProfile, type MemberRole } from '@/lib/member';

interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  currency: string;
}

const driverLinks = memberNavItems
  .filter((item) => item.href !== '/panel' && item.roles.includes('DRIVER'))
  .map((item) => ({
    href: item.href,
    title: getMemberNavLabel(item, 'DRIVER'),
    desc: roleDashboardTitles.DRIVER,
    emoji: item.icon,
  }));

const ownerLinks = memberNavItems
  .filter((item) => item.href !== '/panel' && item.roles.includes('PLATE_OWNER'))
  .map((item) => ({
    href: item.href,
    title: getMemberNavLabel(item, 'PLATE_OWNER'),
    desc: roleDashboardTitles.PLATE_OWNER,
    emoji: item.icon,
  }));

const memberLinks = memberNavItems
  .filter((item) => item.href !== '/panel' && item.roles.includes('USER'))
  .map((item) => ({
    href: item.href,
    title: getMemberNavLabel(item, 'USER'),
    desc: 'Üye hizmeti',
    emoji: item.icon,
  }));

export default function PanelHomePage() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const p = await fetchCurrentProfile();
        setProfile(p);

        if (p?.role === 'DRIVER' || p?.role === 'PLATE_OWNER') {
          try {
            const summaryRes = await api.get<ApiResponse<FinanceSummary>>('/finance/summary');
            setSummary(summaryRes.data ?? null);
          } catch {
            // Finans özeti opsiyonel
          }
        }
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!profile) return <ErrorBlock message="Profil bulunamadı" />;

  const role = profile.role as MemberRole;
  const links =
    role === 'DRIVER' ? driverLinks : role === 'PLATE_OWNER' ? ownerLinks : memberLinks;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hoş geldiniz, ${profile.firstName}`}
        description={roleDashboardTitles[role]}
      />

      {(role === 'DRIVER' || role === 'PLATE_OWNER') && summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Toplam Gelir" value={`${summary.totalIncome.toLocaleString('tr-TR')} ${summary.currency}`} />
          <StatCard label="Toplam Gider" value={`${summary.totalExpense.toLocaleString('tr-TR')} ${summary.currency}`} />
          <StatCard label="Net Kazanç" value={`${summary.net.toLocaleString('tr-TR')} ${summary.currency}`} />
        </div>
      )}

      {role === 'USER' && (
        <div className="rounded-xl border border-iteo-yellow/30 bg-iteo-yellow-light p-6">
          <p className="font-semibold text-iteo-black">İTEO dijital hizmetlerine hoş geldiniz</p>
          <p className="mt-2 text-sm text-iteo-gray-500">
            Duyurular, haberler, ödemeler ve randevu işlemlerinize tek ekrandan ulaşın.
          </p>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-bold text-iteo-black">Hızlı İşlemler</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href + link.title}
              href={link.href}
              className="rounded-xl border border-iteo-gray-200 bg-white p-5 shadow-sm transition hover:border-iteo-yellow hover:shadow-md">
              <span className="text-2xl">{link.emoji}</span>
              <p className="mt-3 font-semibold text-iteo-black">{link.title}</p>
              <p className="mt-1 text-sm text-iteo-gray-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
