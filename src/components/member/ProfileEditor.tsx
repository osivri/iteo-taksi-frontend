'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/AdminUi';
import { roleDashboardTitles, type MemberRole } from '@/lib/member';

export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  profileImageUrl: string | null;
  city: string | null;
  district: string | null;
  addressLine: string | null;
  role: string;
  status: string;
}

interface Props {
  title?: string;
  description?: string;
  onSaved?: (profile: UserProfileData) => void;
}

export function ProfileEditor({
  title = 'Profilim',
  description = 'Ad, soyad, telefon, adres ve profil fotoğrafınızı güncelleyin.',
  onSaved,
}: Props) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get<ApiResponse<UserProfileData>>('/users/me')
      .then((res) => {
        const p = res.data ?? null;
        setProfile(p);
        if (p) {
          setFirstName(p.firstName);
          setLastName(p.lastName);
          setPhone(p.phone ?? '');
          setCity(p.city ?? '');
          setDistrict(p.district ?? '');
          setAddressLine(p.addressLine ?? '');
          setProfileImageUrl(p.profileImageUrl);
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) {
      setError('Lütfen JPG veya PNG formatında bir fotoğraf seçin.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Profil fotoğrafı en fazla 2 MB olabilir.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('bucket', 'profile-images');
      formData.append('file', file);
      const upload = await api.upload<ApiResponse<{ url: string }>>('/storage/upload', formData);
      const url = upload.data?.url;
      if (!url) throw new Error('Fotoğraf yüklenemedi');
      setProfileImageUrl(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.patch<ApiResponse<UserProfileData>>('/users/me', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        district: district.trim() || undefined,
        addressLine: addressLine.trim() || undefined,
        profileImageUrl: profileImageUrl ?? undefined,
      });
      const updated = res.data ?? null;
      if (updated) {
        setProfile(updated);
        onSaved?.(updated);
      }
      setSuccess('Profiliniz güncellendi.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock />;

  const roleLabel =
    profile?.role && profile.role in roleDashboardTitles
      ? roleDashboardTitles[profile.role as MemberRole]
      : profile?.role ?? '';

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() || '?';

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      {error && <ErrorBlock message={error} />}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-xl rounded-xl border border-iteo-gray-200 bg-white p-6 space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt="Profil fotoğrafı"
                width={96}
                height={96}
                className="h-24 w-24 rounded-full border-2 border-iteo-yellow object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-iteo-yellow text-2xl font-bold text-iteo-black">
                {initials}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-iteo-gray-200 px-4 py-2 text-sm font-medium text-iteo-black hover:bg-iteo-gray-100 disabled:opacity-60">
              {uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}
            </button>
            {profileImageUrl && (
              <button
                type="button"
                onClick={() => setProfileImageUrl(null)}
                className="text-xs text-red-600 hover:underline">
                Fotoğrafı kaldır
              </button>
            )}
            <p className="text-xs text-iteo-gray-500">JPG, PNG · Maks. 2 MB</p>
          </div>
        </div>

        {profile && (
          <div className="rounded-lg bg-iteo-gray-100 px-4 py-3 text-sm text-iteo-gray-600">
            <p>
              <span className="font-medium text-iteo-black">Rol:</span> {roleLabel}
            </p>
            {profile.email && (
              <p className="mt-1">
                <span className="font-medium text-iteo-black">E-posta:</span> {profile.email}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-iteo-gray-600">Ad</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-iteo-gray-600">Soyad</span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-iteo-gray-600">Telefon</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XXX XX XX"
            className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-iteo-gray-600">İl</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              placeholder="İstanbul"
              className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-iteo-gray-600">İlçe</span>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              placeholder="Kadıköy"
              className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-iteo-gray-600">Açık Adres</span>
          <textarea
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            required
            rows={3}
            placeholder="Mahalle, sokak, bina no, daire"
            className="w-full rounded-lg border border-iteo-gray-200 px-4 py-2.5"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-iteo-yellow py-3 text-sm font-semibold text-iteo-black disabled:opacity-60">
          {saving ? 'Kaydediliyor...' : 'Profili Kaydet'}
        </button>
      </form>
    </div>
  );
}
