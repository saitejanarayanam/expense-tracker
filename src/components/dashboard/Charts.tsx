'use client';

import { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { byCategory, byPaymentMode, byDay, byWeek, byMonth, heatmapMonth } from '@/lib/aggregate';
import type { Expense, Category, PaymentMode } from '@/lib/database.types';

type View = 'daily' | 'weekly' | 'monthly';

function CustomTooltip({ active, payload, currency }: { active?: boolean; payload?: { name: string; value: number; payload: { color?: string } }[]; currency: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-lg">
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: p.payload.color || 'var(--violet)' }} />
          <span className="font-medium">{p.name}:</span> {formatCurrency(p.value, currency)}
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, currency, emptyLabel }: { data: { name: string; value: number; color: string }[]; currency: string; emptyLabel: string }) {
  if (!data.length) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted">{emptyLabel}</div>;
  }
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={220} className="max-w-[220px]">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={currency} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-1.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-1.5 truncate">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="font-semibold">{formatCurrency(d.value, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardCharts({
  expenses,
  categories,
  paymentModes,
  currency,
}: {
  expenses: Expense[];
  categories: Category[];
  paymentModes: PaymentMode[];
  currency: string;
}) {
  const [view, setView] = useState<View>('daily');

  const categoryData = useMemo(() => byCategory(expenses, categories), [expenses, categories]);
  const paymentModeData = useMemo(() => byPaymentMode(expenses, paymentModes), [expenses, paymentModes]);

  const barData = useMemo(() => {
    if (view === 'daily') return byDay(expenses, 14);
    if (view === 'weekly') return byWeek(expenses, 8);
    return byMonth(expenses, 12);
  }, [expenses, view]);

  const trendData = useMemo(() => byDay(expenses, 30), [expenses]);

  const today = new Date();
  const heatCells = useMemo(() => heatmapMonth(expenses, today.getFullYear(), today.getMonth()), [expenses]);
  const maxHeat = Math.max(1, ...heatCells.filter((c) => c.value >= 0).map((c) => c.value));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="animate-rise">
        <h3 className="mb-4 font-bold">Spending by Category</h3>
        <DonutChart data={categoryData} currency={currency} emptyLabel="No expenses yet" />
      </Card>

      <Card className="animate-rise">
        <h3 className="mb-4 font-bold">Spending by Payment Mode</h3>
        <DonutChart data={paymentModeData} currency={currency} emptyLabel="No expenses yet" />
      </Card>

      <Card className="animate-rise lg:col-span-2">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold">Spend Comparison</h3>
          <div className="flex rounded-full border border-[var(--border)] p-1 text-xs font-semibold">
            {(['daily', 'weekly', 'monthly'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-3 py-1.5 capitalize transition ${
                  view === v ? 'bg-violet text-white' : 'text-muted hover:text-foreground'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Bar dataKey="value" name="Spend" fill="var(--violet)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="animate-rise lg:col-span-2">
        <h3 className="mb-4 font-bold">30-Day Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Legend />
            <Line type="monotone" dataKey="value" name="Spend" stroke="var(--coral)" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="animate-rise lg:col-span-2">
        <h3 className="mb-4 font-bold">{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Heatmap</h3>
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {heatCells.map((c, i) =>
            c.value < 0 ? (
              <div key={i} />
            ) : (
              <div
                key={i}
                title={`${c.date}: ${formatCurrency(c.value, currency)}`}
                className="flex aspect-square items-center justify-center rounded-lg text-[10px] font-medium"
                style={{
                  backgroundColor: c.value === 0 ? 'var(--border)' : `color-mix(in srgb, var(--violet) ${Math.min(100, 15 + (c.value / maxHeat) * 85)}%, transparent)`,
                  color: c.value / maxHeat > 0.5 ? 'white' : 'var(--foreground)',
                }}
              >
                {c.day}
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
