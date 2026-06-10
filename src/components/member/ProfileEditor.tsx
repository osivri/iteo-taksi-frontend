'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { api, ApiResponse } from '@/lib/api/client';
import {
  ErrorBlock,
  LoadingBlock,
  PrimaryButton,
  SectionCard,
  StatusBadge,
} from '@/components/admin/AdminUi';
import { IteoIcon } from '@/components/ui/icons';
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

const statusLabels: Record<string, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  ACTIVE: { label: 'Aktif üye', tone: 'success' },
  PENDING_VERIFICATION: { label: 'Doğrulama bekliyor', tone: 'warning' },
  SUSPENDED: { label: 'Askıya alındı', tone: 'danger' },
  INACTIVE: { label: 'Pasif', tone: 'neutral' },
};

const inputClass =
  'w-full rounded-xl border border-iteo-gray-200 bg-white px-4 py-3 text-iteo-black shadow-sm transition placeholder:text-iteo-gray-500/70 focus:border-iteo-yellow focus:outline-none focus:ring-2 focus:ring-iteo-yellow/25';

const labelClass = 'text-sm font-semibold text-iteo-black';

export function ProfileEditor({
  description = 'Hesap bilgilerinizi güncel tutun; oda hizmetlerine kesintisiz erişin.',
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
      formData.append('file', file);
      const upload = await api.upload<ApiResponse<{ url: string }>>('/storage/profile-images', formData);
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
      setSuccess('Profiliniz başarıyla güncellendi.');
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
      : profile?.role ?? 'Üye';

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() || '?';

  const statusInfo = statusLabels[profile?.status ?? ''] ?? {
    label: profile?.status ?? '—',
    tone: 'neutral' as const,
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-iteo-black via-[#151515] to-[#262626] px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-iteo-yellow/15 blur-2xl" />
        <svg
          className="pointer-events-none absolute bottom-4 right-6 h-24 w-36 text-iteo-yellow/10"
          viewBox="0 0 200 120"
          fill="currentColor"
          aria-hidden
        >
          <path d="M20 80 H180 L165 40 H35 Z" />
          <circle cx="55" cy="88" r="14" />
          <circle cx="145" cy="88" r="14" />
        </svg>
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-iteo-yellow">Hesap</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Profil Ayarları</h2>
          <p className="mt-3 text-sm text-white/65 sm:text-base">{description}</p>
        </div>
      </div>

      {error && <ErrorBlock message={error} />}
      {success && (
        <div className="rounded-2xl border border-iteo-success/30 bg-iteo-success-light px-5 py-4 text-sm font-medium text-iteo-success">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <SectionCard className="overflow-hidden">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-iteo-yellow to-iteo-yellow-dark opacity-80 blur-sm" />
                    {profileImageUrl ? (
                      <Image
                        src={profileImageUrl}
                        alt="Profil fotoğrafı"
                        width={128}
                        height={128}
                        className="relative h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                        unoptimized
                      />
                    ) : (
                      <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-iteo-yellow text-4xl font-black text-iteo-black shadow-lg">
                        {initials}
                      </div>
                    )}
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-iteo-black">
                    {firstName} {lastName}
                  </h3>
                  <p className="mt-1 text-sm text-iteo-gray-500">{roleLabel}</p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <StatusBadge label={statusInfo.label} tone={statusInfo.tone} />
                  </div>

                  {profile?.email && (
                    <p className="mt-4 break-all text-sm text-iteo-gray-500">{profile.email}</p>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />

                  <div className="mt-6 flex w-full flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-iteo-gray-200 bg-iteo-gray-100 px-4 py-3 text-sm font-semibold text-iteo-black transition hover:bg-iteo-yellow/20 hover:border-iteo-yellow/40 disabled:opacity-60"
                    >
                      <IteoIcon name="user" size={18} />
                      {uploading ? 'Yükleniyor...' : 'Fotoğraf Değiştir'}
                    </button>
                    {profileImageUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileImageUrl(null)}
                        className="text-xs font-medium text-iteo-danger hover:underline"
                      >
                        Fotoğrafı kaldır
                      </button>
                    )}
                    <p className="text-xs text-iteo-gray-500">JPG, PNG · Maks. 2 MB</p>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-8">
            <SectionCard title="Kişisel Bilgiler" description="Ad ve soyad bilgileriniz">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className={labelClass}>Ad</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-2">
                  <span className={labelClass}>Soyad</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={inputClass}
                  />
                </label>
              </div>
            </SectionCard>

            <SectionCard title="İletişim" description="Telefon numaranız">
              <label className="block space-y-2">
                <span className={labelClass}>Telefon</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className={inputClass}
                />
              </label>
            </SectionCard>

            <SectionCard title="Adres Bilgileri" description="Oda kayıtları ve hizmetler için gerekli">
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className={labelClass}>İl</span>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="İstanbul"
                      className={inputClass}
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className={labelClass}>İlçe</span>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                      placeholder="Kadıköy"
                      className={inputClass}
                    />
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className={labelClass}>Açık Adres</span>
                  <textarea
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    required
                    rows={4}
                    placeholder="Mahalle, sokak, bina no, daire"
                    className={`${inputClass} resize-y min-h-[120px]`}
                  />
                </label>
              </div>
            </SectionCard>

            <div className="flex flex-col gap-3 rounded-2xl border border-iteo-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-iteo-gray-500">
                Değişiklikler kaydedildikten sonra tüm cihazlarda geçerli olur.
              </p>
              <PrimaryButton type="submit" disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Profili Kaydet'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
