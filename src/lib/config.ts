const DEV_DEFAULT = 'http://localhost:3001/api/v1';

function normalizeApiUrl(url: string): string {
  return url.replace(/\/$/, '');
}

/** Server-side backend API base URL (preferred: API_URL, not exposed to browser). */
export function getServerApiUrl(): string {
  const url =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === 'production' ? '' : DEV_DEFAULT);

  if (!url) {
    throw new Error('API_URL veya NEXT_PUBLIC_API_URL production ortamında zorunludur.');
  }

  if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
    throw new Error('Production API URL HTTPS kullanmalıdır.');
  }

  return normalizeApiUrl(url);
}

/** Public unauthenticated endpoints (e.g. rating submit). */
export function getPublicApiUrl(): string {
  if (typeof window === 'undefined') {
    return getServerApiUrl();
  }

  const url = process.env.NEXT_PUBLIC_API_URL ?? DEV_DEFAULT;
  return normalizeApiUrl(url);
}
