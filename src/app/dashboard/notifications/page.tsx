'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api/client';
import { ErrorBlock, PageHeader } from '@/components/admin/AdminUi';

export default function NotificationsPage() {
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [broadcast, setBroadcast] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSms, setSendSms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post<{ message?: string; data?: { sentCount?: number }; channelResults?: Array<{ channel: string; detail?: string }> }>(
        '/admin/notifications/send',
        {
          userId: broadcast ? undefined : userId,
          title,
          body,
          type: 'SYSTEM',
          channels: [
            ...(sendEmail ? ['email' as const] : []),
            ...(sendSms ? ['sms' as const] : []),
          ],
        },
      );
      const channelLabels: Record<string, string> = { email: 'E-posta', sms: 'SMS' };
      const channelNote = (res.channelResults ?? [])
        .map((c) => `${channelLabels[c.channel] ?? c.channel}: ${c.detail ?? 'tamamlandı'}`)
        .join(' · ');
      setSuccess(
        broadcast
          ? `Tüm aktif kullanıcılara gönderildi (${res.data?.sentCount ?? '—'} kişi)${channelNote ? ` — ${channelNote}` : ''}`
          : `Bildirim gönderildi${channelNote ? ` — ${channelNote}` : ''}`,
      );
      setTitle('');
      setBody('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bildirim Gönder" description="Tek kullanıcıya veya tüm aktif üyelere bildirim iletin" />
      {error && <ErrorBlock message={error} />}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-xl border border-iteo-gray-200 bg-white p-5">
        <label className="flex items-center gap-2 text-sm text-iteo-gray-700">
          <input
            type="checkbox"
            checked={broadcast}
            onChange={(e) => setBroadcast(e.target.checked)}
            className="rounded"
          />
          Tüm aktif kullanıcılara gönder
        </label>
        {!broadcast && (
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Üye kullanıcı kodu"
            required
            className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
          />
        )}
        <label className="flex items-center gap-2 text-sm text-iteo-gray-700">
          <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
          E-posta ile de gönder
        </label>
        <label className="flex items-center gap-2 text-sm text-iteo-gray-700">
          <input type="checkbox" checked={sendSms} onChange={(e) => setSendSms(e.target.checked)} />
          SMS ile de gönder
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Başlık"
          required
          className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Mesaj"
          required
          rows={3}
          className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-iteo-yellow px-4 py-2.5 font-semibold text-iteo-black disabled:opacity-60"
        >
          {saving ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </form>
    </div>
  );
}
