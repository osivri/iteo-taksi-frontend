'use client';

import { parseBackendMessage, sanitizeApiError } from '@/lib/api/errors';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  items?: T[];
  meta?: { page: number; limit: number; total: number };
  message?: string | string[];
}

function backendUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/api/backend${normalized}`;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response = await fetch(backendUrl(path), {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    const refreshed = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (!refreshed.ok) throw new Error('Oturum bulunamadı');
    response = await fetch(backendUrl(path), {
      ...options,
      headers,
      credentials: 'include',
    });
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error(sanitizeApiError('', 'İstek başarısız'));
    }
    return response as unknown as T;
  }

  const json = (await response.json()) as ApiResponse<T> & T;

  if (!response.ok) {
    const raw = parseBackendMessage(json, 'İstek başarısız');
    throw new Error(sanitizeApiError(raw, 'İstek başarısız'));
  }

  return json as T;
}

export async function apiDownload(path: string): Promise<Blob> {
  let response = await fetch(backendUrl(path), { credentials: 'include' });

  if (response.status === 401) {
    const refreshed = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (!refreshed.ok) throw new Error('Oturum bulunamadı');
    response = await fetch(backendUrl(path), { credentials: 'include' });
  }

  if (!response.ok) {
    throw new Error('İndirme başarısız');
  }

  return response.blob();
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) =>
    apiFetch<T>(path, { method: 'POST', body: formData }),
};

export { hasActiveSession } from '@/lib/auth/client';
