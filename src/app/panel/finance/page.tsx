'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, ApiResponse } from '@/lib/api/client';
import { ErrorBlock, LoadingBlock, SectionCard } from '@/components/admin/AdminUi';
import { FinanceBarChart, FinanceTrendChart } from '@/components/member/FinanceCharts';
import { FinancePeriodTabs } from '@/components/member/FinancePeriodTabs';
import { FinanceEntryForm } from '@/components/member/finance/FinanceEntryForm';
import { FinancePlatePicker } from '@/components/member/finance/FinancePlatePicker';
import { FinanceReceiptModal } from '@/components/member/finance/FinanceReceiptModal';
import { FinanceRecordsList } from '@/components/member/finance/FinanceRecordsList';
import { FinanceSummaryStrip } from '@/components/member/finance/FinanceSummaryStrip';
import { ModulePageHero } from '@/components/member/ModulePageHero';
import { IteoIcon } from '@/components/ui/icons';
import {
  buildRangeQuery,
  defaultPeriodSelection,
  formatPeriodHint,
  getPeriodRange,
  type FinancePeriodSelection,
  type FinanceTypeFilter,
} from '@/lib/finance-period';
import { validateReceiptFile } from '@/lib/upload-limits';
import { parseApiItems } from '@/lib/parse-api-list';

interface Vehicle {
  id: string;
  plateNumber: string;
}

interface FinanceRow {
  id: string;
  type: string;
  category: string;
  amount: number;
  recordDate: string;
  description: string | null;
  vehicleId: string | null;
  receiptImageUrl: string | null;
  receiptOcrData?: {
    amount: number | null;
    category: string | null;
    merchant: string | null;
    confidence: number;
  } | null;
}

interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  currency: string;
}

interface ReceiptScanResult {
  amount: number | null;
  recordDate: string | null;
  merchant: string | null;
  category: string | null;
  rawText: string;
  confidence: number;
  provider: string;
}

export default function PanelFinancePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [rows, setRows] = useState<FinanceRow[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [trends, setTrends] = useState<Array<{ date: string; income: number; expense: number; net: number }>>([]);
  const [periodSelection, setPeriodSelection] = useState<FinancePeriodSelection>(defaultPeriodSelection);
  const [typeFilter, setTypeFilter] = useState<FinanceTypeFilter>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pendingReceiptUrl, setPendingReceiptUrl] = useState<string | null>(null);

  const [scanModal, setScanModal] = useState(false);
  const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null);
  const [scanImageUrl, setScanImageUrl] = useState<string | null>(null);
  const [scanCategory, setScanCategory] = useState('');
  const [scanAmount, setScanAmount] = useState('');

  const receiptInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const attachRecordIdRef = useRef<string | null>(null);
  const scanModeRef = useRef<'new' | 'attach'>('new');
  const formRef = useRef<HTMLDivElement>(null);

  const plateById = useMemo(
    () => Object.fromEntries(vehicles.map((v) => [v.id, v.plateNumber])),
    [vehicles],
  );

  const selectedPlate = vehicleId ? plateById[vehicleId] : undefined;
  const canEnterData = Boolean(vehicleId);
  const periodLabel = formatPeriodHint(periodSelection);

  useEffect(() => {
    api
      .get<ApiResponse<Vehicle[]>>('/vehicles?limit=100')
      .then((res) => {
        const list = parseApiItems<Vehicle>(res);
        setVehicles(list);
        setVehicleId((current) => (list.some((v) => v.id === current) ? current : list[0]?.id ?? ''));
      })
      .catch(() => setVehicles([]));
  }, []);

  const load = useCallback(async () => {
    if (!vehicleId) {
      setRows([]);
      setSummary(null);
      setTrends([]);
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    setLoading(true);
    try {
      const range = getPeriodRange(periodSelection);
      const rangeQs = buildRangeQuery(range);
      const recordsQs = new URLSearchParams(rangeQs.replace('?', ''));
      recordsQs.set('limit', '50');
      recordsQs.set('vehicleId', vehicleId);
      if (typeFilter !== 'ALL') recordsQs.set('type', typeFilter);

      const summaryParams = new URLSearchParams(rangeQs.replace('?', ''));
      summaryParams.set('vehicleId', vehicleId);
      const summaryQs = summaryParams.toString() ? `?${summaryParams}` : '';

      const [recordsRes, summaryRes, trendsRes] = await Promise.all([
        api.get<ApiResponse<FinanceRow> & { items: FinanceRow[] }>(`/finance/records?${recordsQs}`),
        api.get<ApiResponse<FinanceSummary>>(`/finance/summary${summaryQs}`),
        api.get<ApiResponse<{ points: typeof trends }>>(`/finance/trends${summaryQs}`),
      ]);

      setRows(recordsRes.items ?? []);
      setSummary(summaryRes.data ?? null);
      setTrends(trendsRes.data?.points ?? []);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [periodSelection, typeFilter, vehicleId]);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadReceiptFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const upload = await api.upload<ApiResponse<{ url: string }>>('/storage/receipts', formData);
    const url = upload.data?.url;
    if (!url) throw new Error('Fiş dosyası yüklenemedi');
    return url;
  }

  async function handleReceiptFile(file: File, mode: 'new' | 'attach', recordId?: string) {
    if (mode === 'new' && !vehicleId) {
      setError('Fiş yüklemeden önce plaka seçmelisiniz.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const url = await uploadReceiptFile(file);

      if (mode === 'attach' && recordId) {
        await api.post(`/finance/records/${recordId}/receipt`, {
          receiptImageUrl: url,
          runOcr: true,
        });
        await load();
        return;
      }

      try {
        const scan = await api.post<ApiResponse<ReceiptScanResult>>('/finance/receipts/scan', {
          imageUrl: url,
        });
        const ocr = scan.data;
        if (ocr) {
          setScanImageUrl(url);
          setScanResult(ocr);
          setScanCategory(ocr.category ?? 'Diğer');
          setScanAmount(ocr.amount != null ? String(ocr.amount) : '');
          setScanModal(true);
          return;
        }
      } catch {
        // OCR başarısız — manuel kayıt
      }

      setPendingReceiptUrl(url);
      setType('EXPENSE');
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function onReceiptInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const validationError = validateReceiptFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    handleReceiptFile(file, scanModeRef.current, attachRecordIdRef.current ?? undefined);
  }

  function openReceiptPicker(mode: 'new' | 'attach', recordId?: string) {
    scanModeRef.current = mode;
    attachRecordIdRef.current = recordId ?? null;
    if (mode === 'attach') {
      attachInputRef.current?.click();
    } else {
      receiptInputRef.current?.click();
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!vehicleId) {
      setError('Kayıt oluşturmak için plaka seçmelisiniz.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.post('/finance/records', {
        type,
        category: category.trim() || (type === 'INCOME' ? 'Hasılat' : 'Gider'),
        amount: Number(amount),
        description: description.trim() || undefined,
        recordDate: new Date(recordDate).toISOString(),
        receiptImageUrl: pendingReceiptUrl ?? undefined,
        vehicleId,
      });
      setCategory('');
      setAmount('');
      setDescription('');
      setPendingReceiptUrl(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function saveFromScan() {
    if (!scanImageUrl || !scanAmount || !vehicleId) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/finance/records/from-receipt', {
        imageUrl: scanImageUrl,
        type: 'EXPENSE',
        category: scanCategory,
        amount: parseFloat(scanAmount),
        saveOcrData: true,
        vehicleId,
      });
      setScanModal(false);
      setScanResult(null);
      setScanImageUrl(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function focusEntry(kind: 'INCOME' | 'EXPENSE') {
    setType(kind);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (initialLoad && !vehicleId && vehicles.length === 0) {
    return <LoadingBlock />;
  }

  return (
    <div className="space-y-6 pb-10">
      <ModulePageHero
        badge="Muhasebe"
        title="Gelir & Gider"
        description="Plaka bazlı hasılat ve giderlerinizi takip edin, fiş tarayın ve dönemsel raporlarınızı görün."
        decoration={
          <svg
            className="pointer-events-none absolute bottom-4 right-8 h-24 w-36 text-iteo-yellow/10"
            viewBox="0 0 200 120"
            fill="currentColor"
            aria-hidden
          >
            <path d="M20 80 H180 L165 40 H35 Z" />
            <circle cx="55" cy="88" r="14" />
            <circle cx="145" cy="88" r="14" />
          </svg>
        }
      />

      {error && <ErrorBlock message={error} />}

      {canEnterData && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openReceiptPicker('new')}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-iteo-black px-4 py-2.5 text-sm font-semibold text-iteo-yellow transition hover:bg-iteo-black-soft disabled:opacity-60"
          >
            <IteoIcon name="receipt" size={18} />
            Fiş Tara
          </button>
          <button
            type="button"
            onClick={() => focusEntry('INCOME')}
            className="inline-flex items-center gap-2 rounded-xl border border-iteo-success/30 bg-iteo-success-light px-4 py-2.5 text-sm font-semibold text-iteo-success"
          >
            + Gelir Ekle
          </button>
          <button
            type="button"
            onClick={() => focusEntry('EXPENSE')}
            className="inline-flex items-center gap-2 rounded-xl border border-iteo-danger/30 bg-iteo-danger-light px-4 py-2.5 text-sm font-semibold text-iteo-danger"
          >
            − Gider Ekle
          </button>
        </div>
      )}

      <FinancePlatePicker
        vehicles={vehicles}
        value={vehicleId}
        onChange={(id) => {
          setVehicleId(id);
          setLoading(true);
        }}
      />

      {canEnterData && (
        <>
          {summary && (
            <FinanceSummaryStrip
              summary={summary}
              periodSelection={periodSelection}
              plateLabel={selectedPlate}
            />
          )}

          <SectionCard
            title="Dönem filtresi"
            description={periodLabel}
            action={
              <span className="rounded-full bg-iteo-gray-100 px-3 py-1 text-xs font-semibold text-iteo-gray-600">
                {selectedPlate}
              </span>
            }
          >
            <FinancePeriodTabs
              embedded
              selection={periodSelection}
              onChange={(sel) => {
                setPeriodSelection(sel);
                setLoading(true);
              }}
            />
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-12 xl:gap-8">
            <div ref={formRef} className="xl:col-span-4">
              <div className="xl:sticky xl:top-24">
                <FinanceEntryForm
                  type={type}
                  onTypeChange={setType}
                  category={category}
                  onCategoryChange={setCategory}
                  amount={amount}
                  onAmountChange={setAmount}
                  recordDate={recordDate}
                  onRecordDateChange={setRecordDate}
                  description={description}
                  onDescriptionChange={setDescription}
                  pendingReceiptUrl={pendingReceiptUrl}
                  onRemoveReceipt={() => setPendingReceiptUrl(null)}
                  onReceiptClick={() => openReceiptPicker('new')}
                  onSubmit={handleSubmit}
                  saving={saving}
                  disabled={!canEnterData}
                  plateLabel={selectedPlate}
                />
              </div>
            </div>

            <div className="space-y-6 xl:col-span-8">
              {summary && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FinanceBarChart
                    income={summary.totalIncome}
                    expense={summary.totalExpense}
                    currency={summary.currency}
                  />
                  <FinanceTrendChart points={trends} currency={summary.currency} />
                </div>
              )}

              <FinanceRecordsList
                rows={rows}
                plateById={plateById}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                periodLabel={`${selectedPlate} · ${periodLabel}`}
                loading={loading}
                saving={saving}
                onAttachReceipt={(id) => openReceiptPicker('attach', id)}
              />
            </div>
          </div>
        </>
      )}

      <input
        ref={receiptInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={onReceiptInputChange}
      />
      <input
        ref={attachInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={onReceiptInputChange}
      />

      {scanModal && (
        <FinanceReceiptModal
          scanResult={scanResult}
          scanImageUrl={scanImageUrl}
          scanCategory={scanCategory}
          scanAmount={scanAmount}
          onCategoryChange={setScanCategory}
          onAmountChange={setScanAmount}
          onSave={saveFromScan}
          onCancel={() => {
            setScanModal(false);
            setScanResult(null);
            if (scanImageUrl) setPendingReceiptUrl(scanImageUrl);
            setScanImageUrl(null);
          }}
          saving={saving}
          plateLabel={selectedPlate}
        />
      )}
    </div>
  );
}
