import { NextResponse } from 'next/server';
import { getPublicApiUrl } from '@/lib/config';
import { parseBackendMessage } from '@/lib/api/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${getPublicApiUrl()}/ratings/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const json = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: parseBackendMessage(json, 'Puan gönderilemedi') },
        { status: response.status },
      );
    }

    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ message: 'Puan gönderilemedi' }, { status: 500 });
  }
}
