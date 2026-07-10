'use client';

import { useEffect, useState } from 'react';
import { Sparkles, FileSpreadsheet, FileText, Download, Loader2, Wallet, Hash, Award, Flame } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, Select } from '@/components/ui';
import { DashboardCharts } from '@/components/dashboard/Charts';
import { EmptyState } from '@/components/EmptyState';
import { sumAmount, byCategory } from '@/lib/aggregate';
import { daysAgoISO, startOfMonthISO, todayISO } from '@/lib/format';
import { formatCurrency } from '@/lib/format';
import type { Category, Expense, PaymentMode } from '@/lib/database.types';

type Preset = 'week' | 'month' | '3months' | 'year' | 'all';

function rangeFor(preset: Preset): { from: string | null; to: string } {
  const to = todayISO();
  if (preset === 'week') return { from: daysAgoISO(6), to };
  if (preset === 'month') return { from: startOfMonthISO(), to };
  if (preset === '3months') return { from: daysAgoISO(89), to };
  if (preset === 'year') return { from: daysAgoISO(364), to };
  return { from: null, to };
}

export function ReportsClient({
  categories,
  paymentModes,
  currency,
}: {
  categories: Category[];
  paymentModes: PaymentMode[];
  currency: string;
}) {
  const [preset, setPreset] = useState<Preset>('month');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const { from, to } = rangeFor(preset);

  useEffect(() => {
    (async () => {
      setExpenses(null);
      const supabase = createClient();
      let query = supabase.from('expenses').select('*').eq('user_id', (await supabase.auth.getUser()).data.user?.id || '').is('deleted_at', null);
      if (from) query = query.gte('date', from);
      query = query.lte('date', to);
      if (categoryFilter) query = query.eq('category', categoryFilter);
      if (paymentModeFilter) query = query.eq('payment_mode', paymentModeFilter);
      const { data } = await query.order('date', { ascending: false }).limit(3000);
      setExpenses(data || []);
    })();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clears the stale AI summary when filters change
    setSummary(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, categoryFilter, paymentModeFilter]);

  async function generateSummary() {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      params.set('to', to);
      const res = await fetch(`/api/insights/summary?${params}`);
      const json = await res.json();
      if (!res.ok) {
        setSummaryError(json.error || 'Could not generate summary');
        return;
      }
      setSummary(json.summary);
    } catch {
      setSummaryError('Network error generating summary');
    } finally {
      setSummaryLoading(false);
    }
  }

  async function exportReport(format: 'csv' | 'xlsx' | 'pdf') {
    setExporting(format);
    try {
      const params = new URLSearchParams({ format });
      if (from) params.set('from', from);
      params.set('to', to);
      if (categoryFilter) params.set('category', categoryFilter);
      if (paymentModeFilter) params.set('paymentMode', paymentModeFilter);
      const res = await fetch(`/api/reports/export?${params}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses.${format}`;
      const disposition = res.headers.get('Content-Disposition');
      const match = disposition?.match(/filename="(.+)"/);
      if (match) a.download = match[1];
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  const total = expenses ? sumAmount(expenses) : 0;
  const catBreakdown = expenses ? byCategory(expenses, categories) : [];
  const topCategory = catBreakdown[0] || null;
  const biggest = expenses ? [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0] : null;

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-3">
        <Select value={preset} onChange={(e) => setPreset(e.target.value as Preset)} className="w-auto">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </Select>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-auto">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.icon} {c.name}
            </option>
          ))}
        </Select>
        <Select value={paymentModeFilter} onChange={(e) => setPaymentModeFilter(e.target.value)} className="w-auto">
          <option value="">All payment modes</option>
          {paymentModes.map((p) => (
            <option key={p.id} value={p.name}>
              {p.icon} {p.name}
            </option>
          ))}
        </Select>

        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportReport('csv')} disabled={exporting !== null}>
            {exporting === 'csv' ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />} CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportReport('xlsx')} disabled={exporting !== null}>
            {exporting === 'xlsx' ? <Loader2 className="animate-spin" size={14} /> : <FileSpreadsheet size={14} />} Excel
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportReport('pdf')} disabled={exporting !== null}>
            {exporting === 'pdf' ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />} PDF
          </Button>
        </div>
      </Card>

      <Card className="animate-rise">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/15 text-violet">
              <Sparkles size={18} />
            </div>
            <h3 className="font-bold">AI Spending Summary</h3>
          </div>
          <Button size="sm" onClick={generateSummary} disabled={summaryLoading}>
            {summaryLoading ? 'Thinking…' : summary ? 'Regenerate' : 'Generate Summary'}
          </Button>
        </div>
        {summaryError && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{summaryError}</p>}
        {summary && <p className="mt-3 text-sm leading-relaxed text-foreground">{summary}</p>}
        {!summary && !summaryError && !summaryLoading && (
          <p className="mt-3 text-sm text-muted">Get a natural-language breakdown of your spending patterns, powered by Gemini.</p>
        )}
      </Card>

      {expenses === null ? (
        <div className="p-10 text-center text-sm text-muted">Loading…</div>
      ) : expenses.length === 0 ? (
        <EmptyState title="Nothing to report yet" description="No expenses match this range or filter combination." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Total in range', value: formatCurrency(total, currency), icon: Wallet, color: 'var(--violet)' },
              { label: 'Transactions', value: String(expenses.length), icon: Hash, color: 'var(--teal)' },
              {
                label: 'Top category',
                value: topCategory ? topCategory.name : '—',
                sub: topCategory ? formatCurrency(topCategory.value, currency) : undefined,
                icon: Award,
                color: 'var(--sunny)',
              },
              {
                label: 'Biggest expense',
                value: biggest ? formatCurrency(Number(biggest.amount), currency) : '—',
                sub: biggest?.vendor || undefined,
                icon: Flame,
                color: 'var(--pink)',
              },
            ].map((c) => (
              <div key={c.label} className="card animate-rise p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${c.color}1f`, color: c.color }}>
                  <c.icon size={18} />
                </div>
                <p className="text-xs font-medium text-muted">{c.label}</p>
                <p className="mt-0.5 truncate text-lg font-extrabold">{c.value}</p>
                {c.sub && <p className="truncate text-xs text-muted">{c.sub}</p>}
              </div>
            ))}
          </div>
          <DashboardCharts expenses={expenses} categories={categories} paymentModes={paymentModes} currency={currency} />
        </>
      )}
    </div>
  );
}
