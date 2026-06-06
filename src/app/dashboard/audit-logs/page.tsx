'use client';

import { useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { DataTable, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface AuditLogRow {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<AuditLogRow> & { items: AuditLogRow[] }>('/admin/audit-logs');
      setRows(res.items ?? []);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader title="İşlem Logları" description="Sistemdeki yönetici işlemleri (salt okunur)" />
      {error && <ErrorBlock message={error} />}

      <DataTable
        columns={[
          { key: 'createdAt', label: 'Tarih' },
          { key: 'action', label: 'İşlem' },
          { key: 'entityType', label: 'Varlık' },
          { key: 'entityId', label: 'Kayıt ID' },
          { key: 'actorId', label: 'Kullanıcı ID' },
        ]}
        rows={rows.map((r) => ({
          createdAt: new Date(r.createdAt).toLocaleString('tr-TR'),
          action: r.action,
          entityType: r.entityType,
          entityId: r.entityId,
          actorId: r.actorId,
        }))}
        emptyMessage="Log kaydı bulunamadı."
      />
    </div>
  );
}
