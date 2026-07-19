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

function DashboardMockup() {
  return (
    <div className="card animate-rise relative mx-auto w-full max-w-lg overflow-hidden p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">This month</p>
          <p className="text-2xl font-extrabold">₹24,850</p>
        </div>
        <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">↓ 12% vs last month</span>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div
          className="h-24 w-24 shrink-0 rounded-full"
          style={{
            background:
              'conic-gradient(var(--coral) 0% 32%, var(--violet) 32% 55%, var(--sunny) 55% 74%, var(--teal) 74% 88%, var(--pink) 88% 100%)',
          }}
        >
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface)] text-[10px] font-bold text-muted">
              7 cats
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {[
            { label: 'Food', color: 'var(--coral)', pct: '32%' },
            { label: 'Bills', color: 'var(--violet)', pct: '23%' },
            { label: 'Shopping', color: 'var(--sunny)', pct: '19%' },
            { label: 'Travel', color: 'var(--teal)', pct: '14%' },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
              <span className="flex-1 text-muted">{c.label}</span>
              <span className="font-semibold">{c.pct}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-1.5">
        {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h * 0.5}px`, background: 'var(--violet)', opacity: 0.35 + (h / 200) }} />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-violet/10 px-3 py-2 text-xs">
        <Sparkles size={14} className="text-violet" />
        <span className="text-foreground">&quot;You spent 18% less on dining out this week — nice work!&quot;</span>
      </div>
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

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 md:grid-cols-2 md:py-20">
        <div className="animate-rise">
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

        <DashboardMockup />
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
