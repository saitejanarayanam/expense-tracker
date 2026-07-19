import Link from 'next/link';
import { GitFork } from 'lucide-react';
import { Button } from '@/components/ui';
import { FEATURES } from '@/lib/landing-features';

const REPO_URL = 'https://github.com/saitejanarayanam/expense-tracker';

export function MarketingHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="group flex items-center gap-2">
        <span className="gradient-brand inline-block h-8 w-8 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
        <span className="text-lg font-extrabold tracking-tight">Spendly</span>
      </Link>
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
  );
}

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="group flex items-center gap-2">
            <span className="gradient-brand inline-block h-7 w-7 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <span className="font-extrabold tracking-tight">Spendly</span>
          </Link>
          <p className="mt-3 text-sm text-muted">Track spending, scan bills with AI, and see where your money goes.</p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-foreground"
          >
            <GitFork size={16} className="transition-transform duration-300 hover:scale-110" />
            View source on GitHub
          </a>
        </div>

        <div>
          <p className="text-sm font-bold">Product</p>
          <ul className="mt-3 space-y-2.5">
            {FEATURES.map((f) => (
              <li key={f.slug}>
                <Link href={`/features/${f.slug}`} className="text-sm text-muted transition-colors hover:text-foreground">
                  {f.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold">Get started</p>
          <ul className="mt-3 space-y-2.5">
            <li>
              <Link href="/signup" className="text-sm text-muted transition-colors hover:text-foreground">
                Create an account
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-sm text-muted transition-colors hover:text-foreground">
                Log in
              </Link>
            </li>
            <li>
              <Link href="/forgot-password" className="text-sm text-muted transition-colors hover:text-foreground">
                Reset password
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold">Built with</p>
          <ul className="mt-3 space-y-2.5 text-sm text-muted">
            <li>Next.js</li>
            <li>Supabase</li>
            <li>Google Gemini</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-6 py-6 text-center text-xs text-muted">
        © {year} Spendly. Built as a demo of AI-powered expense tracking.
      </div>
    </footer>
  );
}
