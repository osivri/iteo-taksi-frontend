'use client';

interface ReceiptScanResult {
  amount: number | null;
  merchant: string | null;
  confidence: number;
}

interface Props {
  scanResult: ReceiptScanResult | null;
  scanImageUrl: string | null;
  scanCategory: string;
  scanAmount: string;
  onCategoryChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  plateLabel?: string;
}

export function FinanceReceiptModal({
  scanResult,
  scanImageUrl,
  scanCategory,
  scanAmount,
  onCategoryChange,
  onAmountChange,
  onSave,
  onCancel,
  saving,
  plateLabel,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-modal-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-2xl">
        <div className="border-b border-iteo-gray-100 bg-iteo-black px-5 py-4">
          <h3 id="receipt-modal-title" className="text-base font-bold text-white">
            Fiş okuma sonucu
          </h3>
          {plateLabel && <p className="mt-0.5 text-xs text-white/70">{plateLabel} için kaydedilecek</p>}
        </div>

        <div className="space-y-4 p-5">
          {scanResult && (
            <div className="rounded-xl bg-iteo-gray-50 px-4 py-3 text-sm">
              <p className="text-iteo-gray-600">
                Okuma güveni:{' '}
                <strong className="text-iteo-black">%{Math.round(scanResult.confidence * 100)}</strong>
              </p>
              {scanResult.merchant && (
                <p className="mt-1 font-medium text-iteo-black">{scanResult.merchant}</p>
              )}
            </div>
          )}

          {scanImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scanImageUrl}
              alt="Fiş önizleme"
              className="max-h-44 w-full rounded-xl border border-iteo-gray-200 object-contain bg-iteo-gray-100"
            />
          )}

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-iteo-gray-500">Kategori</label>
              <input
                type="text"
                value={scanCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-iteo-gray-500">Tutar (₺)</label>
              <input
                type="number"
                value={scanAmount}
                onChange={(e) => onAmountChange(e.target.value)}
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-iteo-gray-200 px-4 py-2.5 text-lg font-bold"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !scanAmount}
              className="flex-1 rounded-xl bg-iteo-yellow py-3 text-sm font-bold text-iteo-black disabled:opacity-50">
              {saving ? 'Kaydediliyor...' : 'Gider olarak kaydet'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-iteo-gray-200 px-4 py-3 text-sm font-medium text-iteo-gray-600 hover:bg-iteo-gray-50">
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
