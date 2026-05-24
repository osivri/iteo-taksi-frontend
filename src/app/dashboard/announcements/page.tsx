'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import {
  ANNOUNCEMENT_CATEGORIES,
  ContentImageUpload,
  PRIORITY_LABELS,
} from '@/components/admin/ContentImageUpload';
import { CrudTable, EditModal, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface AnnouncementRow {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  coverImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
}

export default function AnnouncementsPage() {
  const [rows, setRows] = useState<AnnouncementRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Genel');
  const [priority, setPriority] = useState('NORMAL');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [sendPush, setSendPush] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AnnouncementRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editSendPush, setEditSendPush] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<AnnouncementRow> & { items: AnnouncementRow[] }>(
        '/admin/announcements',
      );
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

  async function createAnnouncement(publish: boolean) {
    setSaving(true);
    setError(null);
    try {
      await api.post('/admin/announcements', {
        title,
        content,
        category,
        priority,
        coverImageUrl: coverImageUrl ?? undefined,
        isPublished: publish,
        sendPush: publish && sendPush,
      });
      setTitle('');
      setContent('');
      setCoverImageUrl(null);
      setSendPush(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(e: FormEvent, publish: boolean) {
    e.preventDefault();
    createAnnouncement(publish);
  }

  async function togglePublish(id: string, isPublished: boolean) {
    try {
      await api.patch(`/admin/announcements/${id}`, { isPublished: !isPublished });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setEditSaving(true);
    try {
      await api.patch(`/admin/announcements/${editing.id}`, {
        title: editing.title,
        content: editing.content,
        category: editing.category,
        priority: editing.priority,
        coverImageUrl: editing.coverImageUrl ?? undefined,
        sendPush: editSendPush,
      });
      setEditing(null);
      setEditSendPush(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEditSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/announcements/${id}`);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <PageHeader title="Duyuru Yönetimi" description="Oda duyurularını oluşturun, düzenleyin ve yayınlayın" />
      {error && <ErrorBlock message={error} />}

      <form className="space-y-4 rounded-2xl border border-iteo-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-iteo-black">Yeni Duyuru</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Başlık"
          required
          className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="İçerik"
          required
          rows={5}
          className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-iteo-gray-600">Kategori</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5">
              {ANNOUNCEMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-iteo-gray-600">Öncelik</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5">
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ContentImageUpload value={coverImageUrl} onChange={setCoverImageUrl} />
        <label className="flex items-center gap-2 text-sm text-iteo-gray-700">
          <input type="checkbox" checked={sendPush} onChange={(e) => setSendPush(e.target.checked)} />
          Yayınlandığında üyelere anlık bildirim gönder
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || !title || !content}
            onClick={(e) => handleSubmit(e, false)}
            className="rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
          </button>
          <button
            type="button"
            disabled={saving || !title || !content}
            onClick={(e) => handleSubmit(e, true)}
            className="rounded-xl bg-iteo-yellow px-4 py-2.5 text-sm font-semibold text-iteo-black disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : 'Yayınla'}
          </button>
        </div>
      </form>

      <CrudTable
        columns={[
          { key: 'title', label: 'Başlık' },
          { key: 'category', label: 'Kategori' },
          { key: 'priority', label: 'Öncelik' },
          { key: 'isPublished', label: 'Yayında' },
        ]}
        rows={rows.map((r) => ({
          id: r.id,
          isPublished: r.isPublished,
          cells: {
            title: r.title,
            category: r.category,
            priority: PRIORITY_LABELS[r.priority] ?? r.priority,
            isPublished: r.isPublished ? 'Evet' : 'Hayır',
          },
        }))}
        onDelete={remove}
        onEdit={(id) => {
          const row = rows.find((r) => r.id === id);
          if (row) setEditing({ ...row });
        }}
        onTogglePublish={togglePublish}
        deletingId={deletingId}
      />

      <EditModal
        title="Duyuru Düzenle"
        open={!!editing}
        saving={editSaving}
        onClose={() => setEditing(null)}
        onSubmit={saveEdit}>
        {editing && (
          <>
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Başlık"
              required
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
            <textarea
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              placeholder="İçerik"
              required
              rows={5}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
            <select
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5">
              {ANNOUNCEMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={editing.priority}
              onChange={(e) => setEditing({ ...editing, priority: e.target.value })}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5">
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <ContentImageUpload
              value={editing.coverImageUrl}
              onChange={(url) => setEditing({ ...editing, coverImageUrl: url })}
            />
            <label className="flex items-center gap-2 text-sm text-iteo-gray-700">
              <input
                type="checkbox"
                checked={editSendPush}
                onChange={(e) => setEditSendPush(e.target.checked)}
              />
              Güncelleme sonrası bildirim gönder
            </label>
          </>
        )}
      </EditModal>
    </div>
  );
}
