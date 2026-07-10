import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSpendingSummary } from '@/lib/gemini';

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const { data: profile } = await supabase.from('profiles').select('currency').eq('id', user.id).single();

  let query = supabase
    .from('expenses')
    .select('amount, category, date, payment_mode, vendor')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .limit(500);
  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data: expenses } = await query;

  try {
    const summary = await generateSpendingSummary(
      (expenses || []).map((e) => ({
        amount: Number(e.amount),
        category: e.category,
        date: e.date,
        paymentMode: e.payment_mode,
        vendor: e.vendor,
      })),
      profile?.currency || 'INR'
    );
    return NextResponse.json({ summary });
  } catch (e) {
    return NextResponse.json({ error: `Could not generate AI summary: ${e instanceof Error ? e.message : 'unknown error'}` }, { status: 502 });
  }
}
