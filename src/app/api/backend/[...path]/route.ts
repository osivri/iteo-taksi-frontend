import { NextRequest, NextResponse } from 'next/server';
import { getServerApiUrl } from '@/lib/config';
import {
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  getRoleFromCookies,
  setAuthCookies,
  clearAuthCookies,
} from '@/lib/auth/session.server';

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) {
    await clearAuthCookies();
    return null;
  }

  const response = await fetch(`${getServerApiUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!response.ok) {
    await clearAuthCookies();
    return null;
  }

  const json = (await response.json()) as {
    data?: { accessToken: string; refreshToken: string; expiresAt?: number | null };
  };

  if (!json.data?.accessToken || !json.data.refreshToken) {
    await clearAuthCookies();
    return null;
  }

  const role = await getRoleFromCookies();
  await setAuthCookies({
    accessToken: json.data.accessToken,
    refreshToken: json.data.refreshToken,
    expiresAt: json.data.expiresAt,
    role: role ?? undefined,
  });

  return json.data.accessToken;
}

async function proxy(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const backendPath = `/${pathSegments.join('/')}`;
  const url = new URL(`${getServerApiUrl()}${backendPath}`);
  url.search = request.nextUrl.search;

  let accessToken = await getAccessTokenFromCookies();
  if (!accessToken) {
    return NextResponse.json({ message: 'Oturum bulunamadı' }, { status: 401 });
  }

  const headers = new Headers();
  const authHeader = request.headers.get('authorization');
  if (authHeader) headers.set('Authorization', authHeader);
  else headers.set('Authorization', `Bearer ${accessToken}`);

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  let response = await fetch(url.toString(), init);

  if (response.status === 401) {
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      return NextResponse.json({ message: 'Oturum bulunamadı' }, { status: 401 });
    }
    headers.set('Authorization', `Bearer ${accessToken}`);
    response = await fetch(url.toString(), { ...init, headers });
  }

  const responseHeaders = new Headers();
  const responseContentType = response.headers.get('content-type');
  if (responseContentType) {
    responseHeaders.set('Content-Type', responseContentType);
  }

  const disposition = response.headers.get('content-disposition');
  if (disposition) {
    responseHeaders.set('Content-Disposition', disposition);
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}
