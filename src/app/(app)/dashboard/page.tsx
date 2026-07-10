import { createClient } from '@/lib/supabase/server';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { DashboardCharts } from '@/components/dashboard/Charts';
import { EmptyState } from '@/components/EmptyState';
import { sumAmount, filterByRange, byCategory } from '@/lib/aggregate';
import { todayISO, daysAgoISO, startOfMonthISO } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const twelveMonthsAgo = daysAgoISO(365);

  const [{ data: profile }, { data: expenses }, { data: categories }, { data: paymentModes }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('date', twelveMonthsAgo)
      .order('date', { ascending: false })
      .limit(3000),
    supabase.from('categories').select('*').eq('user_id', user.id).eq('archived', false),
    supabase.from('payment_modes').select('*').eq('user_id', user.id),
  ]);

  const currency = profile?.currency || 'INR';
  const allExpenses = expenses || [];

  if (allExpenses.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-extrabold">
          Welcome{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="mb-6 text-sm text-muted">Let&apos;s get your spending tracked.</p>
        <EmptyState
          title="Add your first expense"
          description="Log an expense manually or upload a bill and let AI fill in the details for you."
          ctaHref="/expenses/add"
          ctaLabel="Add your first expense"
        />
      </div>
    );
  }

  const today = todayISO();
  const weekAgo = daysAgoISO(6);
  const monthStart = startOfMonthISO();

  const todayTotal = sumAmount(filterByRange(allExpenses, today, today));
  const weekTotal = sumAmount(filterByRange(allExpenses, weekAgo, today));
  const monthExpenses = filterByRange(allExpenses, monthStart, today);
  const monthTotal = sumAmount(monthExpenses);

  const monthCategories = byCategory(monthExpenses, categories || []);
  const topCategory = monthCategories[0] || null;

  const biggest = [...monthExpenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
  const biggestExpense = biggest ? { vendor: biggest.vendor, amount: Number(biggest.amount) } : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">
          Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-sm text-muted">Here&apos;s where your money went recently.</p>
      </div>

      <SummaryCards
        currency={currency}
        todayTotal={todayTotal}
        weekTotal={weekTotal}
        monthTotal={monthTotal}
        topCategory={topCategory}
        biggestExpense={biggestExpense}
      />

      <DashboardCharts expenses={allExpenses} categories={categories || []} paymentModes={paymentModes || []} currency={currency} />
    </div>
  );
}
