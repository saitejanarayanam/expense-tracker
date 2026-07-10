import type { Expense, Category, PaymentMode } from '@/lib/database.types';

export function sumAmount(expenses: Expense[]) {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

export function filterByRange(expenses: Expense[], from: string, to: string) {
  return expenses.filter((e) => e.date >= from && e.date <= to);
}

export function byCategory(expenses: Expense[], categories: Category[]) {
  const colorByName = new Map(categories.map((c) => [c.name, c.color]));
  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) || 0) + Number(e.amount));
  }
  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100, color: colorByName.get(name) || '#95A5A6' }))
    .sort((a, b) => b.value - a.value);
}

export function byPaymentMode(expenses: Expense[], paymentModes: PaymentMode[]) {
  const colorByName = new Map(paymentModes.map((p) => [p.name, p.color]));
  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.payment_mode, (totals.get(e.payment_mode) || 0) + Number(e.amount));
  }
  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100, color: colorByName.get(name) || '#95A5A6' }))
    .sort((a, b) => b.value - a.value);
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function byDay(expenses: Expense[], days: number) {
  const totals = new Map<string, number>();
  const today = new Date();
  const buckets: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = isoDate(d);
    buckets.push(key);
    totals.set(key, 0);
  }
  for (const e of expenses) {
    if (totals.has(e.date)) totals.set(e.date, (totals.get(e.date) || 0) + Number(e.amount));
  }
  return buckets.map((key) => ({
    label: new Date(key + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
    value: Math.round((totals.get(key) || 0) * 100) / 100,
    date: key,
  }));
}

export function byWeek(expenses: Expense[], weeks: number) {
  const today = new Date();
  const buckets: { start: Date; end: Date; label: string }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(today);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    buckets.push({
      start,
      end,
      label: start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
    });
  }
  return buckets.map(({ start, end, label }) => {
    const startIso = isoDate(start);
    const endIso = isoDate(end);
    const value = expenses
      .filter((e) => e.date >= startIso && e.date <= endIso)
      .reduce((s, e) => s + Number(e.amount), 0);
    return { label, value: Math.round(value * 100) / 100 };
  });
}

export function byMonth(expenses: Expense[], months: number) {
  const today = new Date();
  const buckets: { year: number; month: number; label: string }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    buckets.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('en-US', { month: 'short' }) });
  }
  return buckets.map(({ year, month, label }) => {
    const value = expenses
      .filter((e) => {
        const d = new Date(e.date + 'T00:00:00');
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((s, e) => s + Number(e.amount), 0);
    return { label, value: Math.round(value * 100) / 100 };
  });
}

export function heatmapMonth(expenses: Expense[], year: number, month: number) {
  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.date, (totals.get(e.date) || 0) + Number(e.amount));
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const cells: { date: string; day: number; value: number }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ date: '', day: 0, value: -1 });
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ date: key, day, value: Math.round((totals.get(key) || 0) * 100) / 100 });
  }
  return cells;
}
