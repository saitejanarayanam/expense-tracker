import { createClient } from '@/lib/supabase/server';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { PreferencesSection } from '@/components/settings/PreferencesSection';
import { CategoriesSection } from '@/components/settings/CategoriesSection';
import { PaymentModesSection } from '@/components/settings/PaymentModesSection';
import { NotificationsAISection } from '@/components/settings/NotificationsAISection';
import { DataPrivacySection } from '@/components/settings/DataPrivacySection';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: categories }, { data: paymentModes }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('categories').select('*').eq('user_id', user.id).eq('archived', false).order('name'),
    supabase.from('payment_modes').select('*').eq('user_id', user.id).order('sort_order'),
  ]);

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <p className="text-sm text-muted">Manage your account, preferences, and how Spendly&apos;s AI behaves.</p>
      </div>

      <ProfileSection profile={profile} email={user.email || ''} />
      <PreferencesSection profile={profile} />
      <CategoriesSection categories={categories || []} />
      <PaymentModesSection paymentModes={paymentModes || []} />
      <NotificationsAISection profile={profile} />
      <DataPrivacySection userId={user.id} />
    </div>
  );
}
