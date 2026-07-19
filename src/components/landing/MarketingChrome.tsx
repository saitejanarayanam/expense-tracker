import Link from 'next/link';
import { Button } from '@/components/ui';

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
  return (
    <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted">
      <div className="mb-3 flex items-center justify-center gap-2">
        <span className="gradient-brand h-5 w-5 rounded-md" />
        <span className="font-bold text-foreground">Spendly</span>
      </div>
      <p>Built with Next.js, Supabase &amp; Google Gemini.</p>
    </footer>
  );
}
