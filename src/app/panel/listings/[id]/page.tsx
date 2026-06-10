'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock } from '@/components/admin/AdminUi';
import { ListingDetailView } from '@/components/member/listings/ListingDetailView';
import type { Listing } from '@/components/member/listings/listings-shared';

export default function PanelListingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const fromMine = searchParams.get('from') === 'mine';

  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError('Geçersiz ilan.');
      setLoading(false);
      return;
    }

    api
      .get<ApiResponse<Listing>>(`/listings/${id}`)
      .then((res) => setListing(res.data ?? null))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingBlock />;

  if (error || !listing) {
    return (
      <div className="space-y-4 py-8">
        <ErrorBlock message={error ?? 'İlan bulunamadı.'} />
        <Link
          href={fromMine ? '/panel/listings?tab=mine' : '/panel/listings'}
          className="inline-flex text-sm font-semibold text-iteo-yellow hover:underline"
        >
          ← İlanlara dön
        </Link>
      </div>
    );
  }

  const backHref = fromMine ? '/panel/listings?tab=mine' : '/panel/listings';
  const backLabel = fromMine ? 'İlanlarıma dön' : 'Tüm ilanlara dön';

  return <ListingDetailView listing={listing} backHref={backHref} backLabel={backLabel} />;
}
