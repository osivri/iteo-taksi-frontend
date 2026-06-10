'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock } from '@/components/admin/AdminUi';
import { ListingCreateForm } from '@/components/member/listings/ListingCreateForm';
import type { ListingPhotoItem } from '@/components/member/listings/ListingPhotoUploader';
import type { MemberVehicle } from '@/lib/member-vehicles';
import { ListingsBrowsePanel } from '@/components/member/listings/ListingsBrowsePanel';
import { MyListingsPanel } from '@/components/member/listings/MyListingsPanel';
import type { Listing, ListingTab, ListingTypeFilter, SortOption } from '@/components/member/listings/listings-shared';
import { filterListingsClient, sortListings } from '@/components/member/listings/listings-shared';
import { IteoIcon } from '@/components/ui/icons';

const tabs: { id: ListingTab; label: string; icon: 'grid' | 'pin' | 'user' }[] = [
  { id: 'browse', label: 'İlanlara Göz At', icon: 'grid' },
  { id: 'create', label: 'İlan Ver', icon: 'pin' },
  { id: 'mine', label: 'İlanlarım', icon: 'user' },
];

export default function PanelListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<ListingTab>('browse');
  const [browseRaw, setBrowseRaw] = useState<Listing[]>([]);
  const [myItems, setMyItems] = useState<Listing[]>([]);

  const [typeFilter, setTypeFilter] = useState<ListingTypeFilter>('ALL');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [appliedDistrict, setAppliedDistrict] = useState('');
  const [appliedNeighborhood, setAppliedNeighborhood] = useState('');
  const [appliedType, setAppliedType] = useState<ListingTypeFilter>('ALL');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState('VEHICLE_RENTAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [selectedPlate, setSelectedPlate] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [damageInfo, setDamageInfo] = useState('');
  const [photos, setPhotos] = useState<ListingPhotoItem[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const loadBrowse = useCallback(async () => {
    const params = new URLSearchParams({ limit: '50' });
    if (appliedType !== 'ALL') params.set('type', appliedType);
    if (appliedDistrict.trim()) params.set('district', appliedDistrict.trim());
    if (appliedNeighborhood.trim()) params.set('neighborhood', appliedNeighborhood.trim());
    const res = await api.get<ApiResponse<Listing> & { items: Listing[] }>(`/listings?${params}`);
    setBrowseRaw(res.items ?? []);
  }, [appliedDistrict, appliedNeighborhood, appliedType]);

  const loadMine = useCallback(async () => {
    const res = await api.get<ApiResponse<Listing> & { items: Listing[] }>('/listings/mine?limit=50');
    setMyItems(res.items ?? []);
  }, []);

  useEffect(() => {
    const q = searchParams.get('tab');
    if (q === 'mine' || q === 'create' || q === 'browse') {
      setTab(q);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const run = tab === 'browse' ? loadBrowse : tab === 'mine' ? loadMine : async () => {};
    run()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab, loadBrowse, loadMine]);

  const browseItems = useMemo(() => {
    const filtered = filterListingsClient(browseRaw, { search, minPrice, maxPrice });
    return sortListings(filtered, sort);
  }, [browseRaw, search, minPrice, maxPrice, sort]);

  function applyServerFilters() {
    setAppliedDistrict(district);
    setAppliedNeighborhood(neighborhood);
    setAppliedType(typeFilter);
  }

  function clearFilters() {
    setTypeFilter('ALL');
    setDistrict('');
    setNeighborhood('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setAppliedDistrict('');
    setAppliedNeighborhood('');
    setAppliedType('ALL');
  }

  function openListing(listing: Listing, fromMine: boolean) {
    router.push(fromMine ? `/panel/listings/${listing.id}?from=mine` : `/panel/listings/${listing.id}`);
  }

  function handleVehicleChange(id: string, vehicle: MemberVehicle | null) {
    setVehicleId(id);
    setSelectedPlate(vehicle?.plateNumber ?? '');
    if (vehicle) {
      if (vehicle.brand) setBrand(vehicle.brand);
      if (vehicle.model) setModel(vehicle.model);
      if (vehicle.year) setVehicleYear(String(vehicle.year));
    }
  }

  function switchTab(next: ListingTab) {
    setTab(next);
    const qs = next === 'browse' ? '/panel/listings' : `/panel/listings?tab=${next}`;
    router.replace(qs);
  }

  function resetCreateForm() {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setTitle('');
    setDescription('');
    setPrice('');
    setFormDistrict('');
    setFormNeighborhood('');
    setContactPhone('');
    setBrand('');
    setModel('');
    setVehicleYear('');
    setVehicleId('');
    setSelectedPlate('');
    setMileage('');
    setFuelType('');
    setDamageInfo('');
    setPhotos([]);
    setPhotoError(null);
  }

  async function uploadListingPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const upload = await api.upload<ApiResponse<{ url: string }>>('/storage/listing-photos', formData);
    const url = upload.data?.url;
    if (!url) throw new Error('Fotoğraf yüklenemedi');
    return url;
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setPhotoError(null);
    try {
      const photoUrls: string[] = [];
      for (const photo of photos) {
        photoUrls.push(await uploadListingPhoto(photo.file));
      }

      const parsedYear = vehicleYear.trim() ? Number(vehicleYear) : undefined;
      const parsedMileage = mileage.trim() ? Number(mileage) : undefined;

      const res = await api.post<ApiResponse<Listing>>('/listings', {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        district: formDistrict.trim() || undefined,
        neighborhood: formNeighborhood.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        vehicleYear: parsedYear != null && !Number.isNaN(parsedYear) ? parsedYear : undefined,
        plateNumber: selectedPlate.trim() || undefined,
        mileage: parsedMileage != null && !Number.isNaN(parsedMileage) ? parsedMileage : undefined,
        fuelType: fuelType.trim() || undefined,
        damageInfo: damageInfo.trim() || undefined,
        photos: photoUrls.length > 0 ? photoUrls : undefined,
      });
      resetCreateForm();
      const newId = res.data?.id;
      if (newId) {
        router.push(`/panel/listings/${newId}?from=mine`);
      } else {
        switchTab('mine');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading && tab !== 'create') return <LoadingBlock />;

  return (
    <div className="space-y-0 pb-10">
      {/* Sahibinden tarzı üst şerit */}
      <div className="relative -mx-4 -mt-4 mb-6 overflow-hidden border-b border-iteo-gray-200 bg-white px-4 py-6 md:-mx-6 md:px-6">
        <div className="pointer-events-none absolute -right-6 top-0 h-32 w-48 rounded-full bg-iteo-yellow/10 blur-2xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-iteo-yellow">İTEO Pazar Yeri</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-iteo-black sm:text-3xl">İlanlar</h1>
              <p className="mt-2 max-w-xl text-sm text-iteo-gray-500">
                Araç kiralama ve plaka satış ilanları — filtrele, karşılaştır, doğrudan iletişime geç.
              </p>
            </div>
            <button
              type="button"
              onClick={() => switchTab('create')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-iteo-yellow px-5 py-3 text-sm font-bold text-iteo-black shadow-md transition hover:bg-iteo-yellow/90"
            >
              <IteoIcon name="pin" size={18} />
              Ücretsiz İlan Ver
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-1 rounded-xl border border-iteo-gray-200 bg-iteo-gray-50 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition sm:flex-none ${
                  tab === t.id
                    ? 'bg-iteo-yellow text-iteo-black shadow-sm'
                    : 'text-iteo-gray-600 hover:bg-white hover:text-iteo-black'
                }`}
              >
                <IteoIcon name={t.icon} size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {error && <ErrorBlock message={error} />}

        {tab === 'browse' && (
          <ListingsBrowsePanel
            items={browseItems}
            loading={loading}
            typeFilter={typeFilter}
            district={district}
            neighborhood={neighborhood}
            search={search}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sort={sort}
            viewMode={viewMode}
            onTypeFilterChange={(v) => {
              setTypeFilter(v);
              setAppliedType(v);
            }}
            onDistrictChange={setDistrict}
            onNeighborhoodChange={setNeighborhood}
            onSearchChange={setSearch}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onSortChange={setSort}
            onViewModeChange={setViewMode}
            onApplyServerFilters={applyServerFilters}
            onClearFilters={clearFilters}
            onSelectListing={(l) => openListing(l, false)}
          />
        )}

        {tab === 'create' && (
          <ListingCreateForm
            type={type}
            title={title}
            description={description}
            price={price}
            district={formDistrict}
            neighborhood={formNeighborhood}
            contactPhone={contactPhone}
            brand={brand}
            model={model}
            vehicleYear={vehicleYear}
            vehicleId={vehicleId}
            mileage={mileage}
            fuelType={fuelType}
            damageInfo={damageInfo}
            photos={photos}
            photoError={photoError}
            saving={saving}
            onTypeChange={setType}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onPriceChange={setPrice}
            onDistrictChange={setFormDistrict}
            onNeighborhoodChange={setFormNeighborhood}
            onContactPhoneChange={setContactPhone}
            onBrandChange={setBrand}
            onModelChange={setModel}
            onVehicleYearChange={setVehicleYear}
            onVehicleIdChange={handleVehicleChange}
            onMileageChange={setMileage}
            onFuelTypeChange={setFuelType}
            onDamageInfoChange={setDamageInfo}
            onPhotosChange={setPhotos}
            onPhotoError={setPhotoError}
            onSubmit={handleCreate}
          />
        )}

        {tab === 'mine' && (
          <MyListingsPanel
            items={myItems}
            loading={loading}
            onSelect={(l) => openListing(l, true)}
          />
        )}
      </div>
    </div>
  );
}
