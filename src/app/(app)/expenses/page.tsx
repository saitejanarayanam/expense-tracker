import { createClient } from '@/lib/supabase/server';
import { ExpenseHistoryClient } from '@/components/expenses/ExpenseHistoryClient';

export default async function ExpensesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: categories }, { data: paymentModes }, { data: profile }] = await Promise.all([
    supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
    supabase.from('payment_modes').select('*').eq('user_id', user.id).order('sort_order'),
    supabase.from('profiles').select('currency, date_format').eq('id', user.id).single(),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Expense History</h1>
      <p className="mb-6 text-sm text-muted">Search, filter, edit, and manage every expense you&apos;ve logged.</p>
      <ExpenseHistoryClient
        categories={categories || []}
        paymentModes={paymentModes || []}
        currency={profile?.currency || 'INR'}
        dateFormat={profile?.date_format || 'DD/MM/YYYY'}
      />
    </div>
  );
}
