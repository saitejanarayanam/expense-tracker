import { Sparkles, BarChart3, CreditCard, ShieldCheck, FileDown, Zap, type LucideIcon } from 'lucide-react';
import {
  AIReviewScreenshot,
  DashboardScreenshot,
  PaymentModeScreenshot,
  PrivacyScreenshot,
  ReportsScreenshot,
  QuickAddScreenshot,
} from '@/components/landing/ProductScreens';

export interface LandingFeature {
  slug: string;
  icon: LucideIcon;
  color: string;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  screenshot: (props: { className?: string }) => React.ReactElement;
}

export const FEATURES: LandingFeature[] = [
  {
    slug: 'ai-bill-scanning',
    icon: Sparkles,
    color: 'var(--violet)',
    title: 'AI bill scanning',
    tagline: 'The standout feature',
    description:
      'Snap or upload any receipt and Google Gemini reads it for you — vendor, amount, date, category, and payment mode, auto-filled in seconds.',
    bullets: [
      'Upload a PDF, JPG, or PNG, or take a photo right from your phone',
      'Gemini handles OCR and structured extraction in a single step — no separate OCR engine',
      'Extracts vendor, total, date, itemized line items, suggested category, and payment mode',
      'Every field ships with a confidence score, so low-confidence guesses are easy to spot',
      'You always review and confirm before anything is saved — no silent auto-save',
      "Blurry photo? Hit retry, or just fill in the field yourself — there's always a manual fallback",
    ],
    screenshot: AIReviewScreenshot,
  },
  {
    slug: 'vibrant-dashboards',
    icon: BarChart3,
    color: 'var(--coral)',
    title: 'Vibrant dashboards',
    tagline: 'See it, don’t squint at it',
    description:
      'Category and payment-mode breakdowns, daily/weekly/monthly comparisons, trend lines, and a spend heatmap — all understandable in under five seconds.',
    bullets: [
      'Donut charts for spend by category and by payment mode, color-coded and consistent everywhere',
      'Bar chart comparison you can toggle between daily, weekly, and monthly views',
      '30-day trend line so you can see momentum, not just totals',
      'A calendar heatmap that shows your highest and lowest spend days at a glance',
      'Summary cards for today, this week, this month, top category, and biggest expense',
      'Charts update in real time the moment you log a new expense',
    ],
    screenshot: DashboardScreenshot,
  },
  {
    slug: 'payment-modes',
    icon: CreditCard,
    color: 'var(--sunny)',
    title: 'Every payment mode tracked',
    tagline: 'Not just what — how',
    description:
      'Cash, UPI, cards, wallets, cheques — each gets its own color tag so you can see exactly how you paid, not just what for.',
    bullets: [
      'Eight built-in modes: Cash, Bank Transfer, Credit Card, Debit Card, UPI, Digital Wallet, Cheque, and Other',
      'Add a nickname to any card or account, like "HDFC CC ••••4821", to tell multiple cards apart',
      'Filter your expense history and reports by one or more payment modes',
      'A dedicated "spend by payment mode" chart sits right alongside the category breakdown',
      'When you upload a bill, the AI tries to detect the payment mode automatically from the document',
      'Reorder, rename, or add custom payment modes any time from Settings',
    ],
    screenshot: PaymentModeScreenshot,
  },
  {
    slug: 'privacy',
    icon: ShieldCheck,
    color: 'var(--teal)',
    title: 'Private by default',
    tagline: 'Your money, your eyes only',
    description: 'Every account is fully isolated with database-level row security. Your expenses and documents are visible only to you, always.',
    bullets: [
      'Row-level security enforced on every table — not just in application code, but at the database itself',
      'Passwords are hashed and login attempts are rate-limited against brute-force attempts',
      'Uploaded bills are stored in a private bucket only your account can read',
      'Deleting an expense moves it to a 30-day trash first — accidental deletes are always recoverable',
      'Log out of every device at once from Settings if you ever need to',
      'Export or permanently delete all of your data on demand',
    ],
    screenshot: PrivacyScreenshot,
  },
  {
    slug: 'reports-exports',
    icon: FileDown,
    color: 'var(--pink)',
    title: 'One-click reports',
    tagline: 'Ready for your accountant',
    description: 'Export any date range to Excel, PDF, or CSV — ready for taxes, reimbursement, or just peace of mind.',
    bullets: [
      'Daily, weekly, monthly, or fully custom date-range reports',
      'Filter by category or payment mode before exporting',
      'Excel export with proper currency and date formatting, ready for pivot tables',
      'PDF export with summary totals, a category chart, and the full itemized table — ready to email or print',
      'Lightweight CSV export for importing into any other tool',
      'A natural-language AI summary of your spending, generated on demand',
    ],
    screenshot: ReportsScreenshot,
  },
  {
    slug: 'daily-use',
    icon: Zap,
    color: 'var(--blue)',
    title: 'Built for daily use',
    tagline: 'Low friction, high streaks',
    description: 'Log a manual expense in under three taps, with recurring expenses and quick-add built in from day one.',
    bullets: [
      'A floating quick-add button is always one tap away, on every screen',
      'Manual entry takes amount, category, date, payment mode, and notes — nothing more than you need',
      'Mark subscriptions, rent, or EMIs as recurring so you never forget them',
      'Every change saves instantly — no explicit "save" step lag, ever',
      'Switch your dashboard between daily, weekly, and monthly views to match how you think',
      'Pick up right where you left off, on any device',
    ],
    screenshot: QuickAddScreenshot,
  },
];

export function getFeatureBySlug(slug: string) {
  return FEATURES.find((f) => f.slug === slug);
}
