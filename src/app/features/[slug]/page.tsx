import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { MarketingHeader, MarketingFooter } from '@/components/landing/MarketingChrome';
import { FEATURES, getFeatureBySlug } from '@/lib/landing-features';

export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);
  if (!feature) return {};
  return {
    title: `${feature.title} — Spendly`,
    description: feature.description,
  };
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);
  if (!feature) notFound();

  const otherFeatures = FEATURES.filter((f) => f.slug !== feature.slug);
  const Screenshot = feature.screenshot;

  return (
    <div className="min-h-screen overflow-x-hidden">
      <MarketingHeader />

      <section className="mx-auto max-w-6xl px-6 py-8">
        <Link href="/" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground">
          <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Spendly
        </Link>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-16 md:grid-cols-2">
        <div className="animate-rise">
          <span
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-110 hover:-rotate-6"
            style={{ backgroundColor: `${feature.color}1f`, color: feature.color }}
          >
            <feature.icon size={26} />
          </span>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide" style={{ color: feature.color }}>
            {feature.tagline}
          </p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{feature.title}</h1>
          <p className="mt-4 text-lg text-muted">{feature.description}</p>
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
        </div>

        <Screenshot className="animate-rise mx-auto w-full max-w-sm" />
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-extrabold">What you get</h2>
        <ul className="mt-6 space-y-4">
          {feature.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" style={{ color: feature.color }} />
              <span className="text-foreground">{bullet}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-6 text-2xl font-extrabold">Explore more of Spendly</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {otherFeatures.map((f) => (
            <Link
              key={f.slug}
              href={`/features/${f.slug}`}
              className="card group block p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
