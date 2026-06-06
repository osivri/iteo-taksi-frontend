export const IMAGE_MAX_BYTES = 3 * 1024 * 1024;
export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

export function validateImageFile(file: File, maxBytes = IMAGE_MAX_BYTES): string | null {
  if (!file.type.startsWith('image/')) {
    return 'JPG, PNG veya WebP yükleyin.';
  }
  if (file.size > maxBytes) {
    return `Dosya en fazla ${Math.round(maxBytes / (1024 * 1024))} MB olabilir.`;
  }
  return null;
}

export function validateReceiptFile(file: File): string | null {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  if (!isImage && !isPdf) {
    return 'Sadece JPG, PNG, WebP veya PDF yükleyebilirsiniz.';
  }
  if (file.size > RECEIPT_MAX_BYTES) {
    return `Dosya en fazla ${Math.round(RECEIPT_MAX_BYTES / (1024 * 1024))} MB olabilir.`;
  }
  return null;
}
