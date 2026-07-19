import Link from 'next/link';
import { Sparkles, Camera, Wand2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { MarketingHeader, MarketingFooter } from '@/components/landing/MarketingChrome';
import { ProductShowcase } from '@/components/landing/ProductScreens';
import { FEATURES } from '@/lib/landing-features';

const STEPS = [
  { icon: Camera, title: 'Snap or upload a bill', description: 'Drag in a PDF, JPG, or PNG — or take a photo right from your phone.' },
  { icon: Wand2, title: 'AI fills in the details', description: 'Gemini reads the document and drafts the expense: vendor, amount, date, category, payment mode.' },
  { icon: CheckCircle2, title: 'Review, confirm, done', description: 'You always get the final say before anything is saved — edit anything that looks off.' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <MarketingHeader />

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
          <p className="mt-2 text-muted">A finance tracker that&apos;s actually pleasant to open every day. Tap any card to see it in detail.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Link
              key={f.slug}
              href={`/features/${f.slug}`}
              className="card animate-rise group block p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6"
                style={{ backgroundColor: `${f.color}1f`, color: f.color }}
              >
                <f.icon size={20} />
              </div>
              <h3 className="flex items-center gap-1.5 font-bold">
                {f.title}
                <ArrowRight size={14} className="text-muted opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
              </h3>
              <p className="mt-1.5 text-sm text-muted">{f.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-extrabold">From bill to logged expense in three steps</h2>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="group relative text-center">
              <div className="gradient-brand mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
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

      <MarketingFooter />
    </div>
  );
}
