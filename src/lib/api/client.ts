'use client';

import { getAccessToken, refreshAccessToken } from '@/lib/auth/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  items?: T[];
  meta?: { page: number; limit: number; total: number };
  message?: string | string[];
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = await getAccessToken();
  if (!token) throw new Error('Oturum bulunamadı');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    token = await refreshAccessToken();
    if (!token) throw new Error('Oturum bulunamadı');
    headers.Authorization = `Bearer ${token}`;
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  }

  const json = (await response.json()) as ApiResponse<T> & T;

  if (!response.ok) {
    const message =
      typeof json.message === 'string'
        ? json.message
        : Array.isArray(json.message)
          ? json.message.join(', ')
          : 'İstek başarısız';
    throw new Error(message);
  }

  return json as T;
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

export { getAccessToken };
