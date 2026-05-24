'use client';



import { FormEvent, useEffect, useState } from 'react';

import { api, ApiResponse } from '@/lib/api/client';

import { CrudTable, EditModal, ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';



interface OhsRow {

  id: string;

  title: string;

  description: string | null;

  body: string | null;

  type: string;

  category: string;

  isPublished: boolean;

}



const types = ['VIDEO', 'ARTICLE', 'GUIDE', 'FAQ'] as const;

const typeLabels: Record<(typeof types)[number], string> = {
  VIDEO: 'Video',
  ARTICLE: 'Makale',
  GUIDE: 'Rehber',
  FAQ: 'Sık Sorulan Soru',
};



export default function OhsPage() {

  const [rows, setRows] = useState<OhsRow[]>([]);

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');

  const [description, setDescription] = useState('');

  const [body, setBody] = useState('');

  const [category, setCategory] = useState('Genel');

  const [type, setType] = useState<(typeof types)[number]>('FAQ');

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editing, setEditing] = useState<OhsRow | null>(null);

  const [editSaving, setEditSaving] = useState(false);



  async function load() {

    setLoading(true);

    try {

      const res = await api.get<ApiResponse<OhsRow> & { items: OhsRow[] }>('/admin/ohs/contents');

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



  async function handleSubmit(e: FormEvent) {

    e.preventDefault();

    setSaving(true);

    try {

      await api.post('/admin/ohs/contents', {

        title,

        description,

        body,

        category,

        type,

        isPublished: true,

      });

      setTitle('');

      setDescription('');

      setBody('');

      await load();

    } catch (err) {

      setError((err as Error).message);

    } finally {

      setSaving(false);

    }

  }



  async function togglePublish(id: string, isPublished: boolean) {

    try {

      await api.patch(`/admin/ohs/contents/${id}`, { isPublished: !isPublished });

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

      await api.patch(`/admin/ohs/contents/${editing.id}`, {

        title: editing.title,

        description: editing.description ?? undefined,

        body: editing.body ?? undefined,

        category: editing.category,

        type: editing.type,

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

    if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;

    setDeletingId(id);

    try {

      await api.delete(`/admin/ohs/contents/${id}`);

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

      <PageHeader title="İSG İçerik Yönetimi" description="Eğitim, rehber ve sık sorulan sorular" />

      {error && <ErrorBlock message={error} />}



      <form onSubmit={handleSubmit} className="rounded-xl border border-iteo-gray-200 bg-white p-5 space-y-4">

        <h2 className="font-semibold text-iteo-black">Yeni İSG İçeriği</h2>

        <input

          value={title}

          onChange={(e) => setTitle(e.target.value)}

          placeholder="Başlık"

          required

          className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"

        />

        <input

          value={description}

          onChange={(e) => setDescription(e.target.value)}

          placeholder="Kısa açıklama"

          className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"

        />

        <textarea

          value={body}

          onChange={(e) => setBody(e.target.value)}

          placeholder="İçerik / cevap metni"

          rows={4}

          className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"

        />

        <div className="grid gap-4 sm:grid-cols-2">

          <input

            value={category}

            onChange={(e) => setCategory(e.target.value)}

            placeholder="Kategori"

            className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"

          />

          <select

            value={type}

            onChange={(e) => setType(e.target.value as (typeof types)[number])}

            className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"

          >

            {types.map((t) => (

              <option key={t} value={t}>

                {typeLabels[t]}

              </option>

            ))}

          </select>

        </div>

        <button

          type="submit"

          disabled={saving}

          className="rounded-lg bg-iteo-yellow px-4 py-2.5 font-semibold text-iteo-black disabled:opacity-60"

        >

          {saving ? 'Kaydediliyor...' : 'Yayınla'}

        </button>

      </form>



      <CrudTable

        columns={[

          { key: 'title', label: 'Başlık' },

          { key: 'type', label: 'Tip' },

          { key: 'category', label: 'Kategori' },

          { key: 'isPublished', label: 'Yayında' },

        ]}

        rows={rows.map((r) => ({

          id: r.id,

          isPublished: r.isPublished,

          cells: {

            title: r.title,

            type: typeLabels[r.type as (typeof types)[number]] ?? r.type,

            category: r.category,

            isPublished: r.isPublished ? 'Evet' : 'Hayır',

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

        title="İSG İçeriği Düzenle"

        open={!!editing}

        saving={editSaving}

        onClose={() => setEditing(null)}

        onSubmit={saveEdit}

      >

        {editing && (

          <>

            <input

              value={editing.title}

              onChange={(e) => setEditing({ ...editing, title: e.target.value })}

              placeholder="Başlık"

              required

              className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"

            />

            <input

              value={editing.description ?? ''}

              onChange={(e) => setEditing({ ...editing, description: e.target.value })}

              placeholder="Kısa açıklama"

              className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"

            />

            <textarea

              value={editing.body ?? ''}

              onChange={(e) => setEditing({ ...editing, body: e.target.value })}

              placeholder="İçerik / cevap metni"

              rows={4}

              className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"

            />

            <div className="grid gap-4 sm:grid-cols-2">

              <input

                value={editing.category}

                onChange={(e) => setEditing({ ...editing, category: e.target.value })}

                placeholder="Kategori"

                className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"

              />

              <select

                value={editing.type}

                onChange={(e) => setEditing({ ...editing, type: e.target.value })}

                className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"

              >

                {types.map((t) => (

                  <option key={t} value={t}>

                    {typeLabels[t]}

                  </option>

                ))}

              </select>

            </div>

          </>

        )}

      </EditModal>

    </div>

  );

}

