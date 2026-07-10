import { createClient } from '@/lib/supabase/server';
import { DocumentVaultClient } from '@/components/documents/DocumentVaultClient';

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('currency, date_format').eq('id', user.id).single();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Document Vault</h1>
      <p className="mb-6 text-sm text-muted">Every bill and invoice you&apos;ve uploaded, in one place.</p>
      <DocumentVaultClient currency={profile?.currency || 'INR'} dateFormat={profile?.date_format || 'DD/MM/YYYY'} />
    </div>
  );
}
