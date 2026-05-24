'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ContentImageUpload, NEWS_CATEGORIES } from '@/components/admin/ContentImageUpload';
import { CrudTable, EditModal, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';

interface NewsRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  coverImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
}

export default function NewsPage() {
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Sektör');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<NewsRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<NewsRow> & { items: NewsRow[] }>('/admin/news');
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

  async function createNews(publish: boolean) {
    setSaving(true);
    setError(null);
    try {
      await api.post('/admin/news', {
        title,
        summary,
        content,
        category,
        coverImageUrl: coverImageUrl ?? undefined,
        isPublished: publish,
      });
      setTitle('');
      setSummary('');
      setContent('');
      setCoverImageUrl(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(e: FormEvent, publish: boolean) {
    e.preventDefault();
    createNews(publish);
  }

  async function togglePublish(id: string, isPublished: boolean) {
    try {
      await api.patch(`/admin/news/${id}`, { isPublished: !isPublished });
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
      await api.patch(`/admin/news/${editing.id}`, {
        title: editing.title,
        summary: editing.summary,
        content: editing.content,
        category: editing.category,
        coverImageUrl: editing.coverImageUrl ?? undefined,
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEditSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/news/${id}`);
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
      <PageHeader title="Haber Yönetimi" description="İTEO haberleri ve sektörel gelişmeleri yönetin" />
      {error && <ErrorBlock message={error} />}

      <form className="space-y-4 rounded-2xl border border-iteo-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-iteo-black">Yeni Haber</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Başlık"
          required
          className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
        />
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Kısa özet (liste görünümünde gösterilir)"
          required
          className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Haber içeriği"
          required
          rows={6}
          className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
        />
        <label className="block space-y-1">
          <span className="text-sm font-medium text-iteo-gray-600">Kategori</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5">
            {NEWS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <ContentImageUpload value={coverImageUrl} onChange={setCoverImageUrl} />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || !title || !summary || !content}
            onClick={(e) => handleSubmit(e, false)}
            className="rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
          </button>
          <button
            type="button"
            disabled={saving || !title || !summary || !content}
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
          { key: 'isPublished', label: 'Yayında' },
          { key: 'publishedAt', label: 'Yayın Tarihi' },
        ]}
        rows={rows.map((r) => ({
          id: r.id,
          isPublished: r.isPublished,
          cells: {
            title: r.title,
            category: r.category,
            isPublished: r.isPublished ? 'Evet' : 'Hayır',
            publishedAt: r.publishedAt ? new Date(r.publishedAt).toLocaleDateString('tr-TR') : '—',
          },
        }))}
        onEdit={(id) => {
          const row = rows.find((r) => r.id === id);
          if (row) setEditing({ ...row });
        }}
        onDelete={remove}
        onTogglePublish={togglePublish}
        deletingId={deletingId}
      />

      <EditModal
        title="Haber Düzenle"
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
            <input
              value={editing.summary}
              onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
              placeholder="Özet"
              required
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
            <textarea
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              placeholder="İçerik"
              required
              rows={6}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5"
            />
            <select
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5">
              {NEWS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ContentImageUpload
              value={editing.coverImageUrl}
              onChange={(url) => setEditing({ ...editing, coverImageUrl: url })}
            />
          </>
        )}
      </EditModal>
    </div>
  );
}
