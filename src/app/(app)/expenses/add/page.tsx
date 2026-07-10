import { createClient } from '@/lib/supabase/server';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';

export default async function AddExpensePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: categories }, { data: paymentModes }, { data: profile }] = await Promise.all([
    supabase.from('categories').select('*').eq('user_id', user.id).eq('archived', false).order('name'),
    supabase.from('payment_modes').select('*').eq('user_id', user.id).order('sort_order'),
    supabase.from('profiles').select('auto_approve_ai').eq('id', user.id).single(),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Add Expense</h1>
      <p className="mb-6 text-sm text-muted">Log it manually, or upload a bill and let AI do the typing.</p>
      <ExpenseForm
        userId={user.id}
        categories={categories || []}
        paymentModes={paymentModes || []}
        autoApproveAi={profile?.auto_approve_ai || false}
      />
    </div>
  );
}
