import { createClient } from '@/lib/supabase/server';
import { ReportsClient } from '@/components/reports/ReportsClient';

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: categories }, { data: paymentModes }, { data: profile }] = await Promise.all([
    supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
    supabase.from('payment_modes').select('*').eq('user_id', user.id).order('sort_order'),
    supabase.from('profiles').select('currency').eq('id', user.id).single(),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Reports &amp; Insights</h1>
      <p className="mb-6 text-sm text-muted">Understand your spending, then export it for records or reimbursement.</p>
      <ReportsClient categories={categories || []} paymentModes={paymentModes || []} currency={profile?.currency || 'INR'} />
    </div>
  );
}
