'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, PageHeader } from '@/components/admin/AdminUi';

interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

const segmentRoles = [
  { value: 'USER', label: 'Üye' },
  { value: 'DRIVER', label: 'Şoför' },
  { value: 'PLATE_OWNER', label: 'Plaka Sahibi' },
] as const;

export default function NotificationsPage() {
  const [userId, setUserId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [broadcast, setBroadcast] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSms, setSendSms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUserOptions([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const params = new URLSearchParams({ search: query.trim(), limit: '10' });
      const res = await api.get<ApiResponse<UserOption> & { items: UserOption[] }>(
        `/admin/users?${params.toString()}`,
      );
      setUserOptions(res.items ?? []);
    } catch {
      setUserOptions([]);
    } finally {
      setSearchingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (broadcast) return;
    const timer = setTimeout(() => searchUsers(userSearch), 300);
    return () => clearTimeout(timer);
  }, [broadcast, userSearch, searchUsers]);

  function toggleRole(role: string) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  function selectUser(user: UserOption) {
    setUserId(user.id);
    setUserSearch(`${user.firstName} ${user.lastName}${user.email ? ` (${user.email})` : ''}`);
    setUserOptions([]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post<{
        message?: string;
        data?: { sentCount?: number };
        channelResults?: Array<{ channel: string; detail?: string }>;
      }>('/admin/notifications/send', {
        userId: broadcast ? undefined : userId,
        title,
        body,
        type: 'SYSTEM',
        roles: broadcast && selectedRoles.length > 0 ? selectedRoles : undefined,
        channels: [
          ...(sendEmail ? ['email' as const] : []),
          ...(sendSms ? ['sms' as const] : []),
        ],
      });
      const channelLabels: Record<string, string> = { email: 'E-posta', sms: 'SMS' };
      const channelNote = (res.channelResults ?? [])
        .map((c) => `${channelLabels[c.channel] ?? c.channel}: ${c.detail ?? 'tamamlandı'}`)
        .join(' · ');
      setSuccess(
        broadcast
          ? `Bildirim gönderildi (${res.data?.sentCount ?? '—'} kişi)${channelNote ? ` — ${channelNote}` : ''}`
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
      <PageHeader title="Bildirim Gönder" description="Tek kullanıcıya veya hedef kitleye bildirim iletin" />
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
          Toplu gönderim (tüm aktif kullanıcılar veya rol filtresi)
        </label>

        {broadcast && (
          <div className="space-y-2 rounded-lg border border-iteo-gray-100 bg-iteo-gray-50 p-3">
            <p className="text-xs font-medium text-iteo-gray-500">Hedef roller (boş = tüm roller)</p>
            <div className="flex flex-wrap gap-3">
              {segmentRoles.map((role) => (
                <label key={role.value} className="flex items-center gap-2 text-sm text-iteo-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.value)}
                    onChange={() => toggleRole(role.value)}
                    className="rounded"
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {!broadcast && (
          <div className="relative space-y-1">
            <input
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setUserId('');
              }}
              placeholder="Kullanıcı ara (ad, e-posta, telefon)..."
              required={!userId}
              className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
            />
            {searchingUsers && (
              <p className="text-xs text-iteo-gray-500">Aranıyor...</p>
            )}
            {userOptions.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-iteo-gray-200 bg-white shadow-lg">
                {userOptions.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => selectUser(user)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-iteo-gray-100"
                    >
                      {user.firstName} {user.lastName}
                      {user.email ? ` · ${user.email}` : ''}
                      {user.phone ? ` · ${user.phone}` : ''}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {userId && <p className="text-xs text-green-700">Kullanıcı seçildi</p>}
          </div>
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
          disabled={saving || (!broadcast && !userId)}
          className="rounded-lg bg-iteo-yellow px-4 py-2.5 font-semibold text-iteo-black disabled:opacity-60"
        >
          {saving ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </form>
    </div>
  );
}
