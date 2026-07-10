import { formatCurrency } from '@/lib/format';
import { TrendingUp, Calendar, CalendarDays, Award, Flame } from 'lucide-react';

export function SummaryCards({
  currency,
  todayTotal,
  weekTotal,
  monthTotal,
  topCategory,
  biggestExpense,
}: {
  currency: string;
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  topCategory: { name: string; value: number } | null;
  biggestExpense: { vendor: string | null; amount: number } | null;
}) {
  const cards = [
    { label: 'Spent today', value: formatCurrency(todayTotal, currency), icon: Calendar, color: 'var(--coral)' },
    { label: 'This week', value: formatCurrency(weekTotal, currency), icon: CalendarDays, color: 'var(--teal)' },
    { label: 'This month', value: formatCurrency(monthTotal, currency), icon: TrendingUp, color: 'var(--violet)' },
    {
      label: 'Top category',
      value: topCategory ? `${topCategory.name}` : '—',
      sub: topCategory ? formatCurrency(topCategory.value, currency) : undefined,
      icon: Award,
      color: 'var(--sunny)',
    },
    {
      label: 'Biggest expense',
      value: biggestExpense ? formatCurrency(biggestExpense.amount, currency) : '—',
      sub: biggestExpense?.vendor || undefined,
      icon: Flame,
      color: 'var(--pink)',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((c, i) => (
        <div key={c.label} className="card animate-rise p-4" style={{ animationDelay: `${i * 40}ms` }}>
          <div
            className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${c.color}1f`, color: c.color }}
          >
            <c.icon size={18} />
          </div>
          <p className="text-xs font-medium text-muted">{c.label}</p>
          <p className="mt-0.5 truncate text-lg font-extrabold">{c.value}</p>
          {c.sub && <p className="truncate text-xs text-muted">{c.sub}</p>}
        </div>
      ))}
    </div>
  );
}
