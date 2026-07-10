'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, RotateCcw, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, Input, Label, Select, Textarea } from '@/components/ui';
import { todayISO } from '@/lib/format';
import type { Category, PaymentMode } from '@/lib/database.types';
import type { ExtractedExpense } from '@/lib/gemini';

type Mode = 'manual' | 'upload';

interface FormState {
  amount: string;
  category: string;
  date: string;
  paymentMode: string;
  paymentAccountLabel: string;
  vendor: string;
  notes: string;
  isRecurring: boolean;
  recurrenceInterval: string;
}

const EMPTY_FORM: FormState = {
  amount: '',
  category: '',
  date: todayISO(),
  paymentMode: '',
  paymentAccountLabel: '',
  vendor: '',
  notes: '',
  isRecurring: false,
  recurrenceInterval: 'monthly',
};

function ConfidenceDot({ score }: { score?: number }) {
  if (score === undefined) return null;
  const color = score >= 0.8 ? 'var(--success)' : score >= 0.5 ? 'var(--sunny)' : 'var(--danger)';
  const label = score >= 0.8 ? 'High confidence' : score >= 0.5 ? 'Medium confidence' : 'Low confidence — please verify';
  return <span title={label} className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />;
}

export function ExpenseForm({
  userId,
  categories,
  paymentModes,
  autoApproveAi,
}: {
  userId: string;
  categories: Category[];
  paymentModes: PaymentMode[];
  autoApproveAi: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('manual');
  const [form, setForm] = useState<FormState>({
    ...EMPTY_FORM,
    category: categories[0]?.name || '',
    paymentMode: paymentModes[0]?.name || '',
  });
  const [confidence, setConfidence] = useState<ExtractedExpense['confidence']>({});
  const [linkedDocumentId, setLinkedDocumentId] = useState<string | null>(null);
  const [source, setSource] = useState<'manual' | 'ai'>('manual');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadError(null);
    setUploadWarning(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/documents/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error || 'Upload failed');
        setUploading(false);
        return;
      }
      const extracted: ExtractedExpense | null = json.document?.extracted_data || null;
      setDocId(json.document.id);
      setDocPreviewUrl(json.url || null);
      setLinkedDocumentId(json.document.id);
      setSource('ai');
      if (json.warning) setUploadWarning(json.warning);

      if (extracted) {
        setConfidence(extracted.confidence || {});
        setForm((f) => ({
          ...f,
          amount: extracted.amount != null ? String(extracted.amount) : '',
          category: extracted.category || f.category,
          date: extracted.date || f.date,
          paymentMode: extracted.paymentMode || f.paymentMode,
          paymentAccountLabel: extracted.paymentAccountLabel || '',
          vendor: extracted.vendor || '',
          notes:
            extracted.items && extracted.items.length
              ? extracted.items.map((it) => `${it.name}${it.amount ? ` — ${it.amount}` : ''}`).join('\n')
              : f.notes,
        }));
      }
    } catch {
      setUploadError('Upload failed. Check your connection and try again.');
    } finally {
      setUploading(false);
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) uploadFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: uploading,
  });

  async function retryParse() {
    if (!docId) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await fetch(`/api/documents/${docId}/reparse`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error || 'Retry failed');
        return;
      }
      const extracted: ExtractedExpense = json.document.extracted_data;
      setConfidence(extracted.confidence || {});
      setForm((f) => ({
        ...f,
        amount: extracted.amount != null ? String(extracted.amount) : f.amount,
        category: extracted.category || f.category,
        date: extracted.date || f.date,
        paymentMode: extracted.paymentMode || f.paymentMode,
        paymentAccountLabel: extracted.paymentAccountLabel || f.paymentAccountLabel,
        vendor: extracted.vendor || f.vendor,
      }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);

    const amountNum = parseFloat(form.amount);
    if (!amountNum || amountNum <= 0) {
      setSaveError('Enter a valid amount greater than 0');
      return;
    }
    if (!form.category) {
      setSaveError('Category is required');
      return;
    }
    if (!form.paymentMode) {
      setSaveError('Payment mode is required');
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('expenses').insert({
      user_id: userId,
      amount: amountNum,
      category: form.category,
      date: form.date,
      payment_mode: form.paymentMode,
      payment_account_label: form.paymentAccountLabel || null,
      vendor: form.vendor || null,
      notes: form.notes || null,
      is_recurring: form.isRecurring,
      recurrence_interval: form.isRecurring ? form.recurrenceInterval : null,
      source,
      ai_confidence: source === 'ai' ? confidence : null,
      linked_document_id: linkedDocumentId,
    });
    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    router.push('/expenses');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex rounded-full border border-[var(--border)] p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'manual' ? 'bg-violet text-white' : 'text-muted hover:text-foreground'}`}
        >
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 transition ${mode === 'upload' ? 'bg-violet text-white' : 'text-muted hover:text-foreground'}`}
        >
          <Sparkles size={15} /> Upload &amp; Scan with AI
        </button>
      </div>

      {mode === 'upload' && !docId && (
        <Card
          {...getRootProps()}
          className={`animate-rise cursor-pointer border-2 border-dashed py-12 text-center transition ${isDragActive ? 'border-violet bg-violet/5' : ''}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto mb-3 text-violet" size={36} />
          {uploading ? (
            <p className="font-medium">Uploading &amp; reading with Gemini AI…</p>
          ) : (
            <>
              <p className="font-medium">Drag &amp; drop a bill, or click to browse</p>
              <p className="mt-1 text-sm text-muted">PDF, JPG or PNG, up to 10MB</p>
            </>
          )}
          <div className="mt-4 flex justify-center gap-3">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
            >
              📷 Take a Photo
            </Button>
          </div>
          {uploadError && <p className="mt-4 text-sm text-danger">{uploadError}</p>}
        </Card>
      )}

      {mode === 'upload' && docId && (
        <Card className="animate-rise">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {uploadError ? (
                <AlertTriangle className="text-danger" size={18} />
              ) : (
                <CheckCircle2 className="text-success" size={18} />
              )}
              Document scanned — review the details below
            </div>
            {docPreviewUrl && (
              <a href={docPreviewUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-violet hover:underline">
                <FileText size={14} /> View original
              </a>
            )}
          </div>
          {uploadWarning && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-sunny/15 px-3 py-2 text-xs text-foreground">
              <span>{uploadWarning}</span>
              <button type="button" onClick={retryParse} className="flex shrink-0 items-center gap-1 font-semibold text-violet">
                <RotateCcw size={12} /> Retry
              </button>
            </div>
          )}
          {autoApproveAi && (
            <p className="mt-3 text-xs text-muted">Auto-approve is on for high-confidence fields, but you can still edit anything below.</p>
          )}
        </Card>
      )}

      {(mode === 'manual' || docId) && (
        <Card className="animate-rise">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="flex items-center gap-1.5">
                  Amount <ConfidenceDot score={confidence.amount} />
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => update('amount', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="date" className="flex items-center gap-1.5">
                  Date <ConfidenceDot score={confidence.date} />
                </Label>
                <Input id="date" type="date" required value={form.date} onChange={(e) => update('date', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="flex items-center gap-1.5">
                  Category <ConfidenceDot score={confidence.category} />
                </Label>
                <Select id="category" required value={form.category} onChange={(e) => update('category', e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentMode" className="flex items-center gap-1.5">
                  Payment Mode <ConfidenceDot score={confidence.paymentMode} />
                </Label>
                <Select id="paymentMode" required value={form.paymentMode} onChange={(e) => update('paymentMode', e.target.value)}>
                  {paymentModes.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.icon} {p.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendor" className="flex items-center gap-1.5">
                  Vendor <ConfidenceDot score={confidence.vendor} />
                </Label>
                <Input id="vendor" value={form.vendor} onChange={(e) => update('vendor', e.target.value)} placeholder="e.g. Blue Tokai Coffee" />
              </div>
              <div>
                <Label htmlFor="paymentAccountLabel">Card / Account label</Label>
                <Input
                  id="paymentAccountLabel"
                  value={form.paymentAccountLabel}
                  onChange={(e) => update('paymentAccountLabel', e.target.value)}
                  placeholder="e.g. HDFC CC ••••4821"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Optional notes or itemized list" />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isRecurring"
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) => update('isRecurring', e.target.checked)}
                className="h-4 w-4 rounded border-[var(--border)] text-violet"
              />
              <Label htmlFor="isRecurring" className="mb-0">
                This is a recurring expense
              </Label>
              {form.isRecurring && (
                <Select
                  value={form.recurrenceInterval}
                  onChange={(e) => update('recurrenceInterval', e.target.value)}
                  className="ml-auto w-auto"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              )}
            </div>

            {saveError && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{saveError}</p>}

            <Button type="submit" disabled={saving} className="w-full" size="lg">
              {saving ? 'Saving…' : 'Save Expense'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
