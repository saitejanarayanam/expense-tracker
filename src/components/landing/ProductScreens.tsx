import { CheckCircle2, Search, Lock, FileSpreadsheet, FileText, Download, Plus } from 'lucide-react';

const SAMPLE_CATEGORIES = [
  { name: 'Food', color: '#FF6B6B', pct: 32 },
  { name: 'Bills/Utilities', color: '#6C5CE7', pct: 23 },
  { name: 'Shopping', color: '#FFA502', pct: 19 },
  { name: 'Travel', color: '#4D96FF', pct: 14 },
];

const SAMPLE_PAYMENT_MODES = [
  { name: 'UPI', color: '#F39C12', pct: 38 },
  { name: 'Credit Card', color: '#E74C3C', pct: 27 },
  { name: 'Bank Transfer', color: '#3498DB', pct: 20 },
  { name: 'Cash', color: '#2ECC71', pct: 15 },
];

const SAMPLE_EXPENSES = [
  { vendor: 'Blue Tokai Coffee', category: 'Food', catColor: '#FF6B6B', mode: 'UPI', modeColor: '#F39C12', amount: '₹650.00' },
  { vendor: 'HDFC Card Bill', category: 'Bills/Utilities', catColor: '#6C5CE7', mode: 'Bank Transfer', modeColor: '#3498DB', amount: '₹4,200.00' },
  { vendor: 'Zara', category: 'Shopping', catColor: '#FFA502', mode: 'Credit Card', modeColor: '#E74C3C', amount: '₹2,340.00' },
  { vendor: 'Uber', category: 'Travel', catColor: '#4D96FF', mode: 'Digital Wallet', modeColor: '#1ABC9C', amount: '₹380.00' },
];

/** Small "browser chrome" wrapper so each screen recreation reads as a captured app window. */
export function ScreenFrame({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`card overflow-hidden shadow-2xl ${className || ''}`}>
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--border)]/30 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-coral/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-sunny/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-2 truncate rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-[10px] font-medium text-muted">
          spendly.app/{label}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/** Faithful recreation of the real Dashboard screen — same summary-card, donut, and bar-chart styling as the live app. */
export function DashboardScreenshot({ className }: { className?: string }) {
  return (
    <ScreenFrame label="dashboard" className={className}>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          { label: 'This month', value: '₹24,850', color: 'var(--violet)' },
          { label: 'Top category', value: 'Food', color: 'var(--sunny)' },
          { label: 'Biggest', value: '₹4,200', color: 'var(--pink)' },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-[var(--border)] p-2.5">
            <div className="mb-1.5 h-5 w-5 rounded-lg" style={{ backgroundColor: `${c.color}1f` }} />
            <p className="text-[9px] font-medium text-muted">{c.label}</p>
            <p className="truncate text-xs font-extrabold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3">
        <div
          className="h-16 w-16 shrink-0 rounded-full"
          style={{ background: 'conic-gradient(#FF6B6B 0% 32%, #6C5CE7 32% 55%, #FFA502 55% 74%, #4D96FF 74% 88%, #95A5A6 88% 100%)' }}
        >
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-9 w-9 rounded-full bg-[var(--surface)]" />
          </div>
        </div>
        <div className="flex-1 space-y-1">
          {SAMPLE_CATEGORIES.map((c) => (
            <div key={c.name} className="flex items-center gap-1.5 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
              <span className="flex-1 truncate text-muted">{c.name}</span>
              <span className="font-semibold">{c.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-end gap-1 rounded-xl border border-[var(--border)] p-3">
        {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h * 0.4}px`, background: 'var(--violet)', opacity: 0.35 + h / 200 }} />
        ))}
      </div>
    </ScreenFrame>
  );
}

/** Faithful recreation of the real Expense History screen — identical category/payment-mode badge styling to the live table. */
export function ExpenseHistoryScreenshot({ className }: { className?: string }) {
  return (
    <ScreenFrame label="expenses" className={className}>
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[10px] text-muted">
        <Search size={11} /> Search vendor or notes…
      </div>
      <div className="space-y-1.5">
        {SAMPLE_EXPENSES.map((e) => (
          <div key={e.vendor} className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-2.5 py-2">
            <span className="flex-1 truncate text-[11px] font-semibold">{e.vendor}</span>
            <span
              className="hidden shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:inline-block"
              style={{ backgroundColor: `${e.catColor}1a`, color: e.catColor }}
            >
              {e.category}
            </span>
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
              style={{ backgroundColor: `${e.modeColor}1a`, color: e.modeColor }}
            >
              {e.mode}
            </span>
            <span className="shrink-0 text-[11px] font-bold">{e.amount}</span>
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

/** Faithful recreation of the AI bill-scan review card — identical confidence-dot pattern to the real Add Expense flow. */
export function AIReviewScreenshot({ className }: { className?: string }) {
  const fields = [
    { label: 'Vendor', value: 'Blue Tokai Coffee', score: 'var(--success)' },
    { label: 'Amount', value: '₹650.00', score: 'var(--success)' },
    { label: 'Category', value: 'Food', score: 'var(--sunny)' },
    { label: 'Payment Mode', value: 'UPI', score: 'var(--success)' },
  ];
  return (
    <ScreenFrame label="add" className={className}>
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold">
        <CheckCircle2 className="text-success" size={15} />
        Document scanned — review the details
      </div>
      <div className="space-y-1.5">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[10px]">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: f.score }} />
              {f.label}
            </span>
            <span className="font-semibold">{f.value}</span>
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

/** Recreation of the "Spend by Payment Mode" donut from the real Dashboard/Reports screens. */
export function PaymentModeScreenshot({ className }: { className?: string }) {
  return (
    <ScreenFrame label="dashboard" className={className}>
      <p className="mb-2 text-[10px] font-bold text-muted">SPEND BY PAYMENT MODE</p>
      <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3">
        <div
          className="h-16 w-16 shrink-0 rounded-full"
          style={{ background: 'conic-gradient(#F39C12 0% 38%, #E74C3C 38% 65%, #3498DB 65% 85%, #2ECC71 85% 100%)' }}
        >
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-9 w-9 rounded-full bg-[var(--surface)]" />
          </div>
        </div>
        <div className="flex-1 space-y-1">
          {SAMPLE_PAYMENT_MODES.map((p) => (
            <div key={p.name} className="flex items-center gap-1.5 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
              <span className="flex-1 truncate text-muted">{p.name}</span>
              <span className="font-semibold">{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[10px] text-muted">
        HDFC CC ••••4821 <span className="float-right font-semibold text-foreground">₹2,340.00</span>
      </div>
    </ScreenFrame>
  );
}

/** Recreation of the Reports & Insights export row and AI summary card. */
export function ReportsScreenshot({ className }: { className?: string }) {
  return (
    <ScreenFrame label="reports" className={className}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {[
          { label: 'CSV', icon: Download },
          { label: 'Excel', icon: FileSpreadsheet },
          { label: 'PDF', icon: FileText },
        ].map((b) => (
          <span key={b.label} className="flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-semibold">
            <b.icon size={11} /> {b.label}
          </span>
        ))}
      </div>
      <div className="rounded-xl bg-violet/10 p-3 text-[10px] leading-relaxed text-foreground">
        <span className="font-bold text-violet">✨ AI Summary — </span>
        You spent 18% less on dining out this week compared to last week. Bills/Utilities remains your top category at
        23% of total spend.
      </div>
      <div className="mt-2 flex items-center justify-between rounded-lg border border-[var(--border)] px-2.5 py-2 text-[10px]">
        <span className="text-muted">Total in range</span>
        <span className="font-extrabold">₹24,850.00</span>
      </div>
    </ScreenFrame>
  );
}

/** Recreation of the Settings screen's data-privacy section. */
export function PrivacyScreenshot({ className }: { className?: string }) {
  return (
    <ScreenFrame label="settings" className={className}>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/15 text-teal">
          <Lock size={16} />
        </div>
        <div>
          <p className="text-[11px] font-bold">Row-level security</p>
          <p className="text-[9px] text-muted">Enforced on every table</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {['Your expenses', 'Your documents', 'Your categories'].map((row) => (
          <div key={row} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[10px]">
            <span>{row}</span>
            <span className="flex items-center gap-1 font-semibold text-success">
              <Lock size={10} /> Private
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-lg bg-success/10 px-2.5 py-1.5 text-[10px] font-medium text-success">
        No other account can ever see this data.
      </div>
    </ScreenFrame>
  );
}

/** Recreation of the quick-add / manual entry flow. */
export function QuickAddScreenshot({ className }: { className?: string }) {
  return (
    <ScreenFrame label="expenses/add" className={className}>
      <div className="space-y-1.5">
        {[
          { label: 'Amount', value: '₹650.00' },
          { label: 'Category', value: '🍔 Food' },
          { label: 'Payment Mode', value: '📲 UPI' },
        ].map((f) => (
          <div key={f.label} className="rounded-lg border border-[var(--border)] px-2.5 py-1.5">
            <p className="text-[9px] text-muted">{f.label}</p>
            <p className="text-[11px] font-semibold">{f.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-coral px-3 py-2 text-[10px] font-bold text-white">
        <Plus size={12} /> Save Expense
      </div>
    </ScreenFrame>
  );
}

export function ProductShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-md md:h-[460px]">
      <DashboardScreenshot className="animate-rise mb-5 w-full md:absolute md:left-0 md:top-4 md:mb-0 md:w-[300px] md:rotate-[-4deg]" />
      <ExpenseHistoryScreenshot className="animate-rise mb-5 w-full md:absolute md:right-0 md:top-24 md:mb-0 md:w-[280px] md:rotate-[3deg]" />
      <AIReviewScreenshot className="animate-rise w-full max-w-[220px] md:absolute md:bottom-0 md:left-10 md:w-[220px] md:rotate-[-2deg]" />
    </div>
  );
}
