'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PrimaryButton,
  SectionCard,
  StatCard,
  StatusBadge,
  paymentStatusTone,
} from '@/components/admin/AdminUi';
import { ModulePageHero } from '@/components/member/ModulePageHero';
import { IteoIcon } from '@/components/ui/icons';

interface Payment {
  id: string;
  type: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt?: string;
}

interface FeeConfig {
  key: string;
  amount: number;
  currency: string;
  label: string | null;
}

type PaymentType = 'DUES' | 'APP_FEE' | 'SERVICE_FEE';
type PaymentTab = 'pay' | 'history';

const paymentTabs: { id: PaymentTab; label: string; icon: 'card' | 'receipt' }[] = [
  { id: 'pay', label: 'Ödeme Başlat', icon: 'card' },
  { id: 'history', label: 'Ödeme Geçmişi', icon: 'receipt' },
];

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  SUCCESS: 'Ödendi',
  FAILED: 'Başarısız',
  CANCELLED: 'İptal',
  REFUNDED: 'İade',
};

const typeLabels: Record<string, string> = {
  DUES: 'Oda Aidatı',
  APP_FEE: 'Uygulama Ücreti',
  SERVICE_FEE: 'Hizmet Bedeli',
  OTHER: 'Diğer',
};

const typeDescriptions: Record<PaymentType, string> = {
  DUES: 'Yıllık oda üyelik aidatı',
  APP_FEE: 'Dijital platform kullanım ücreti',
  SERVICE_FEE: 'Oda hizmet bedeli',
};

const typeIcons: Record<PaymentType, 'receipt' | 'card' | 'bell'> = {
  DUES: 'receipt',
  APP_FEE: 'card',
  SERVICE_FEE: 'bell',
};

export default function PanelPaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [fees, setFees] = useState<FeeConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PaymentTab>('pay');
  const [payingType, setPayingType] = useState<PaymentType | null>(null);

  const load = useCallback(async () => {
    const [paymentsRes, feesRes] = await Promise.all([
      api.get<ApiResponse<Payment> & { items: Payment[] }>('/payments?limit=50'),
      api.get<ApiResponse<FeeConfig[]>>('/fees'),
    ]);
    setItems(paymentsRes.items ?? []);
    setFees(feesRes.data ?? []);
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  const stats = useMemo(() => {
    const pending = items.filter((p) => p.status === 'PENDING');
    const paid = items.filter((p) => p.status === 'SUCCESS');
    const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);
    const paidTotal = paid.reduce((s, p) => s + p.amount, 0);
    return { pendingCount: pending.length, paidCount: paid.length, pendingTotal, paidTotal };
  }, [items]);

  const payableFees = useMemo(() => {
    const order: PaymentType[] = ['DUES', 'APP_FEE', 'SERVICE_FEE'];
    return order
      .map((key) => fees.find((f) => f.key === key))
      .filter((f): f is FeeConfig => Boolean(f));
  }, [fees]);

  async function startCheckout(type: PaymentType) {
    setPayingType(type);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post<
        ApiResponse<{ payment: Payment; checkoutUrl?: string }>
      >('/payments/checkout', { type });
      const checkoutUrl = res.data?.checkoutUrl;
      if (checkoutUrl && typeof window !== 'undefined') {
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        setSuccess('Ödeme sayfası açıldı. İşlem tamamlandığında geçmiş güncellenir.');
      } else {
        setSuccess('Ödeme kaydı oluşturuldu. Onay bekleniyor.');
      }
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPayingType(null);
    }
  }

  if (loading) return <LoadingBlock />;

  const duesFee = fees.find((f) => f.key === 'DUES');

  return (
    <div className="space-y-6 pb-8">
      <ModulePageHero
        badge="Finans"
        title="Ödemeler"
        description="Oda aidatı ve hizmet bedellerinizi güvenle ödeyin; geçmişinizi tek ekrandan takip edin."
        decoration={
          <svg
            className="pointer-events-none absolute bottom-4 right-6 h-20 w-28 text-iteo-yellow/10"
            viewBox="0 0 120 80"
            fill="currentColor"
            aria-hidden
          >
            <rect x="8" y="16" width="104" height="56" rx="10" />
            <rect x="8" y="32" width="104" height="12" />
          </svg>
        }
      />

      {error && <ErrorBlock message={error} />}
      {success && (
        <div className="rounded-2xl border border-iteo-success/30 bg-iteo-success-light px-5 py-4 text-sm font-medium text-iteo-success">
          {success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Bekleyen ödeme"
          value={stats.pendingCount}
          hint={stats.pendingCount > 0 ? `${stats.pendingTotal.toLocaleString('tr-TR')} ₺ toplam` : 'Güncel'}
          tone={stats.pendingCount > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="Tamamlanan"
          value={stats.paidCount}
          hint={stats.paidCount > 0 ? `${stats.paidTotal.toLocaleString('tr-TR')} ₺ ödendi` : undefined}
          tone="default"
        />
        <StatCard
          label="Güncel aidat"
          value={duesFee ? `${duesFee.amount.toLocaleString('tr-TR')} ₺` : '—'}
          hint="Yıllık oda aidatı"
        />
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-iteo-gray-200 bg-iteo-gray-50 p-1">
        {paymentTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition sm:flex-none ${
              tab === t.id
                ? 'bg-iteo-yellow text-iteo-black shadow-sm'
                : 'text-iteo-gray-600 hover:bg-white hover:text-iteo-black'
            }`}
          >
            <IteoIcon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pay' ? (
        <div>
          {payableFees.length === 0 ? (
            <EmptyState
              icon="card"
              title="Tarife bulunamadı"
              description="Ödeme tutarları yüklenemedi. Lütfen daha sonra tekrar deneyin."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {payableFees.map((fee, index) => {
                const type = fee.key as PaymentType;
                const isPrimary = index === 0;
                return (
                  <div
                    key={fee.key}
                    className={`relative overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md ${
                      isPrimary
                        ? 'border-iteo-yellow/40 bg-gradient-to-br from-iteo-yellow via-[#ffdb4d] to-iteo-yellow-dark'
                        : 'border-iteo-gray-200 bg-white'
                    }`}
                  >
                    {isPrimary && (
                      <span className="absolute right-3 top-3 rounded-full bg-iteo-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-iteo-yellow">
                        Önerilen
                      </span>
                    )}
                    <div className="relative flex flex-col p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isPrimary ? 'bg-iteo-black/10' : 'bg-iteo-gray-100'
                          }`}
                        >
                          <IteoIcon
                            name={typeIcons[type] ?? 'card'}
                            size={18}
                            className={isPrimary ? 'text-iteo-black' : 'text-iteo-black/70'}
                          />
                        </div>
                        <div className="min-w-0 flex-1 pr-14">
                          <p className="text-sm font-bold text-iteo-black">
                            {fee.label ?? typeLabels[type]}
                          </p>
                          <p className={`mt-0.5 text-xs leading-snug ${isPrimary ? 'text-iteo-black/65' : 'text-iteo-gray-500'}`}>
                            {typeDescriptions[type]}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-2xl font-black tracking-tight text-iteo-black">
                        {fee.amount.toLocaleString('tr-TR')}{' '}
                        <span className="text-lg">{fee.currency === 'TRY' ? '₺' : fee.currency}</span>
                      </p>
                      <div className="mt-3">
                        <PrimaryButton onClick={() => startCheckout(type)} disabled={payingType !== null}>
                          {payingType === type
                            ? 'Yönlendiriliyor...'
                            : `${fee.label ?? typeLabels[type]} Öde`}
                        </PrimaryButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <SectionCard title="Ödeme Geçmişi" description={`${items.length} kayıt listeleniyor`}>
          {items.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="Henüz ödeme yok"
              description="İlk ödemenizi başlattığınızda kayıtlar burada görünür."
            />
          ) : (
            <ul className="divide-y divide-iteo-gray-100">
              {items.map((payment) => (
                <li
                  key={payment.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-iteo-gray-100">
                      <IteoIcon name="receipt" size={20} className="text-iteo-black/70" />
                    </div>
                    <div>
                      <p className="font-semibold text-iteo-black">
                        {typeLabels[payment.type] ?? payment.type}
                      </p>
                      <p className="mt-0.5 text-sm text-iteo-gray-500">
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleString('tr-TR')
                          : 'Ödeme tarihi bekleniyor'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                    <p className="text-lg font-bold text-iteo-black">
                      {payment.amount.toLocaleString('tr-TR')} ₺
                    </p>
                    <StatusBadge
                      label={statusLabels[payment.status] ?? payment.status}
                      tone={paymentStatusTone(payment.status)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      )}
    </div>
  );
}
