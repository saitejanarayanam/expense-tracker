import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="card animate-rise flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="gradient-brand flex h-14 w-14 items-center justify-center rounded-2xl text-white">
        <Sparkles size={26} />
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {ctaHref && ctaLabel && (
        <Link href={ctaHref}>
          <Button className="mt-2">{ctaLabel}</Button>
        </Link>
      )}
    </div>
  );
}
