'use client';

import { useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, PageHeader } from '@/components/admin/AdminUi';

interface ReminderRunResult {
  processed: number;
  sent: number;
  skipped: number;
}

export default function RemindersPage() {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ReminderRunResult | null>(null);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  async function runReminders() {
    setRunning(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<ReminderRunResult>>('/admin/reminders/run', {});
      setLastResult(res.data ?? null);
      setLastRunAt(new Date().toLocaleString('tr-TR'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hatırlatmalar"
        description="Muayene, sigorta ve ruhsat hatırlatmalarını manuel çalıştırın"
      />
      {error && <ErrorBlock message={error} />}

      <div className="max-w-lg space-y-4 rounded-xl border border-iteo-gray-200 bg-white p-5">
        <p className="text-sm text-iteo-gray-600">
          30 gün içinde süresi dolacak araç belgeleri için plaka sahiplerine bildirim gönderilir.
          Daha önce gönderilmiş hatırlatmalar atlanır.
        </p>
        <button
          type="button"
          onClick={runReminders}
          disabled={running}
          className="rounded-lg bg-iteo-yellow px-4 py-2.5 font-semibold text-iteo-black disabled:opacity-60"
        >
          {running ? 'Çalıştırılıyor...' : 'Hatırlatmaları Çalıştır'}
        </button>
      </div>

      {lastResult && (
        <div className="max-w-lg rounded-xl border border-iteo-gray-200 bg-white p-5">
          <h2 className="font-semibold text-iteo-black">Son Çalıştırma</h2>
          {lastRunAt && (
            <p className="mt-1 text-xs text-iteo-gray-500">{lastRunAt}</p>
          )}
          <dl className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <dt className="text-xs text-iteo-gray-500">İşlenen</dt>
              <dd className="mt-1 text-2xl font-bold text-iteo-black">{lastResult.processed}</dd>
            </div>
            <div>
              <dt className="text-xs text-iteo-gray-500">Gönderilen</dt>
              <dd className="mt-1 text-2xl font-bold text-green-600">{lastResult.sent}</dd>
            </div>
            <div>
              <dt className="text-xs text-iteo-gray-500">Atlanan</dt>
              <dd className="mt-1 text-2xl font-bold text-iteo-gray-600">{lastResult.skipped}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
