'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { DataTable, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface Payment {
  id: string;
  type: string;
  amount: number;
  status: string;
  paidAt: string | null;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  SUCCESS: 'Başarılı',
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

export default function PanelPaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<ApiResponse<Payment> & { items: Payment[] }>('/payments?limit=30');
    setItems(res.items ?? []);
  }, []);

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  async function payPending() {
    setPaying(true);
    setError(null);
    try {
      await api.post('/payments/checkout', { type: 'DUES', amount: 500 });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader title="Ödemeler" description="Aidat ve hizmet ödemeleriniz." />

      {error && <ErrorBlock message={error} />}

      <div className="rounded-xl border border-iteo-yellow/30 bg-iteo-yellow-light p-5">
        <p className="font-semibold text-iteo-black">Oda aidatı ödemesi</p>
        <p className="mt-1 text-sm text-iteo-gray-600">Demo ödeme akışı ile aidat ödemenizi simüle edebilirsiniz.</p>
        <button
          type="button"
          onClick={payPending}
          disabled={paying}
          className="mt-4 rounded-lg bg-iteo-yellow px-4 py-2 text-sm font-semibold text-iteo-black disabled:opacity-60">
          {paying ? 'İşleniyor...' : 'Aidat Öde (Demo)'}
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'typeLabel', label: 'Tür' },
          { key: 'amountLabel', label: 'Tutar' },
          { key: 'statusLabel', label: 'Durum' },
          { key: 'paidAt', label: 'Tarih' },
        ]}
        rows={items.map((p) => ({
          typeLabel: typeLabels[p.type] ?? p.type,
          amountLabel: `${p.amount.toLocaleString('tr-TR')} ₺`,
          statusLabel: statusLabels[p.status] ?? p.status,
          paidAt: p.paidAt ? new Date(p.paidAt).toLocaleDateString('tr-TR') : '—',
        }))}
        emptyMessage="Henüz ödeme kaydı yok"
      />
    </div>
  );
}
