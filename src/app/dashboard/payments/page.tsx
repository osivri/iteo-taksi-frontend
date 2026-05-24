'use client';

import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { DataTable, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface PaymentRow {
  id: string;
  type: string;
  amount: number;
  status: string;
  paidAt: string | null;
}

const paymentTypeLabels: Record<string, string> = {
  DUES: 'Oda Aidatı',
  APP_FEE: 'Uygulama Ücreti',
  SERVICE_FEE: 'Hizmet Bedeli',
  OTHER: 'Diğer',
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  SUCCESS: 'Başarılı',
  FAILED: 'Başarısız',
  CANCELLED: 'İptal',
  REFUNDED: 'İade',
};

export default function PaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<PaymentRow> & { items: PaymentRow[] }>('/admin/payments')
      .then((res) => setRows(res.items ?? []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div>
      <PageHeader title="Ödeme Takibi" description="Aidat ve uygulama ücreti kayıtları" />
      <DataTable
        columns={[
          { key: 'type', label: 'Tip' },
          { key: 'amount', label: 'Tutar (₺)' },
          { key: 'status', label: 'Durum' },
          { key: 'paidAt', label: 'Ödeme Tarihi' },
        ]}
        rows={rows.map((r) => ({
          type: paymentTypeLabels[r.type] ?? r.type,
          amount: r.amount.toLocaleString('tr-TR'),
          status: paymentStatusLabels[r.status] ?? r.status,
          paidAt: r.paidAt ? new Date(r.paidAt).toLocaleDateString('tr-TR') : '—',
        }))}
      />
    </div>
  );
}
