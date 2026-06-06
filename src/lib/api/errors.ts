export function sanitizeApiError(message: string, fallback = 'İstek başarısız'): string {
  if (process.env.NODE_ENV === 'development' && message.trim()) {
    return message;
  }
  return fallback;
}

export function parseBackendMessage(json: unknown, fallback: string): string {
  if (!json || typeof json !== 'object') return fallback;
  const record = json as { message?: string | string[] };
  if (typeof record.message === 'string') return record.message;
  if (Array.isArray(record.message)) return record.message.join(', ');
  return fallback;
}
