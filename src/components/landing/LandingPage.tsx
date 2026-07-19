import Link from 'next/link';
import {
  Sparkles,
  BarChart3,
  CreditCard,
  ShieldCheck,
  FileDown,
  Zap,
  Camera,
  Wand2,
  CheckCircle2,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui';

const FEATURES = [
  {
    icon: Sparkles,
    color: 'var(--violet)',
    title: 'AI bill scanning',
    description: 'Snap or upload any receipt and Gemini reads it for you — vendor, amount, date, category, and payment mode, auto-filled in seconds.',
  },
  {
    icon: BarChart3,
    color: 'var(--coral)',
    title: 'Vibrant dashboards',
    description: 'Category and payment-mode breakdowns, daily/weekly/monthly comparisons, trend lines, and a spend heatmap — all at a glance.',
  },
  {
    icon: CreditCard,
    color: 'var(--sunny)',
    title: 'Every payment mode tracked',
    description: 'Cash, UPI, cards, wallets, cheques — each gets its own color tag so you can see exactly how you paid, not just what for.',
  },
  {
    icon: ShieldCheck,
    color: 'var(--teal)',
    title: 'Private by default',
    description: 'Every account is fully isolated with row-level security. Your expenses and documents are visible only to you, always.',
  },
  {
    icon: FileDown,
    color: 'var(--pink)',
    title: 'One-click reports',
    description: 'Export any date range to Excel, PDF, or CSV — ready for taxes, reimbursement, or just peace of mind.',
  },
  {
    icon: Zap,
    color: 'var(--blue)',
    title: 'Built for daily use',
    description: 'Log a manual expense in under three taps, with recurring expenses and quick-add built in from day one.',
  },
];

const STEPS = [
  { icon: Camera, title: 'Snap or upload a bill', description: 'Drag in a PDF, JPG, or PNG — or take a photo right from your phone.' },
  { icon: Wand2, title: 'AI fills in the details', description: 'Gemini reads the document and drafts the expense: vendor, amount, date, category, payment mode.' },
  { icon: CheckCircle2, title: 'Review, confirm, done', description: 'You always get the final say before anything is saved — edit anything that looks off.' },
];

const SAMPLE_CATEGORIES = [
  { name: 'Food', color: '#FF6B6B', pct: 32 },
  { name: 'Bills/Utilities', color: '#6C5CE7', pct: 23 },
  { name: 'Shopping', color: '#FFA502', pct: 19 },
  { name: 'Travel', color: '#4D96FF', pct: 14 },
];

const SAMPLE_EXPENSES = [
  { vendor: 'Blue Tokai Coffee', category: 'Food', catColor: '#FF6B6B', mode: 'UPI', modeColor: '#F39C12', amount: '₹650.00' },
  { vendor: 'HDFC Card Bill', category: 'Bills/Utilities', catColor: '#6C5CE7', mode: 'Bank Transfer', modeColor: '#3498DB', amount: '₹4,200.00' },
  { vendor: 'Zara', category: 'Shopping', catColor: '#FFA502', mode: 'Credit Card', modeColor: '#E74C3C', amount: '₹2,340.00' },
  { vendor: 'Uber', category: 'Travel', catColor: '#4D96FF', mode: 'Digital Wallet', modeColor: '#1ABC9C', amount: '₹380.00' },
];

/** Small "browser chrome" wrapper so each screen recreation reads as a captured app window. */
function ScreenFrame({
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
function DashboardScreenshot({ className }: { className?: string }) {
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
function ExpenseHistoryScreenshot({ className }: { className?: string }) {
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
function AIReviewScreenshot({ className }: { className?: string }) {
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

function ProductShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-md md:h-[460px]">
      <DashboardScreenshot className="animate-rise mb-5 w-full md:absolute md:left-0 md:top-4 md:mb-0 md:w-[300px] md:rotate-[-4deg]" />
      <ExpenseHistoryScreenshot className="animate-rise mb-5 w-full md:absolute md:right-0 md:top-24 md:mb-0 md:w-[280px] md:rotate-[3deg]" />
      <AIReviewScreenshot className="animate-rise w-full max-w-[220px] md:absolute md:bottom-0 md:left-10 md:w-[220px] md:rotate-[-2deg]" />
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="gradient-brand h-8 w-8 rounded-xl" />
          <span className="text-lg font-extrabold tracking-tight">Spendly</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started Free</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-12 md:grid-cols-2 md:py-20">
        <div className="order-2 md:order-1">
          <ProductShowcase />
        </div>

        <div className="animate-rise order-1 md:order-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet/10 px-3 py-1.5 text-xs font-semibold text-violet">
            <Sparkles size={13} /> Powered by Google Gemini
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Track spending without the <span className="text-coral">spreadsheet</span> homework.
          </h1>
          <p className="mt-4 text-lg text-muted">
            Snap a photo of any bill and Spendly reads it for you. Vendor, amount, category, payment mode — auto-filled in
            seconds, so you can actually stick with tracking your money.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button size="lg">
                Get Started Free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                I already have an account
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted">Free to use. No credit card required.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-extrabold">Everything you need, nothing you don&apos;t</h2>
          <p className="mt-2 text-muted">A finance tracker that&apos;s actually pleasant to open every day.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="card animate-rise p-6" style={{ animationDelay: `${i * 60}ms` }}>
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${f.color}1f`, color: f.color }}
              >
                <f.icon size={20} />
              </div>
              <h3 className="font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-extrabold">From bill to logged expense in three steps</h2>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="gradient-brand mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg">
                <s.icon size={24} />
              </div>
              <p className="mt-3 text-xs font-bold text-muted">STEP {i + 1}</p>
              <h3 className="mt-1 font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="gradient-brand animate-rise rounded-3xl px-8 py-14 text-center text-white shadow-xl">
          <h2 className="text-3xl font-extrabold">Start tracking in under a minute</h2>
          <p className="mx-auto mt-2 max-w-md text-white/90">
            Create your free account and add your first expense — manually or by uploading a bill.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-violet transition hover:opacity-90 active:scale-[0.97]"
          >
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="gradient-brand h-5 w-5 rounded-md" />
          <span className="font-bold text-foreground">Spendly</span>
        </div>
        <p>Built with Next.js, Supabase &amp; Google Gemini.</p>
      </footer>
    </div>
  );
}
