'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card } from '@/components/ui';

export function DataPrivacySection({ userId }: { userId: string }) {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function exportData() {
    setExporting(true);
    const supabase = createClient();
    const [{ data: profile }, { data: expenses }, { data: categories }, { data: paymentModes }, { data: documents }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('expenses').select('*').eq('user_id', userId),
      supabase.from('categories').select('*').eq('user_id', userId),
      supabase.from('payment_modes').select('*').eq('user_id', userId),
      supabase.from('documents').select('id, file_name, upload_date, parsed_status, extracted_data').eq('user_id', userId),
    ]);
    const payload = { exportedAt: new Date().toISOString(), profile, expenses, categories, paymentModes, documents };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendly-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  async function logoutAllDevices() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: 'global' });
    router.push('/login');
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold">Data &amp; Privacy</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Export all my data</p>
            <p className="text-xs text-muted">Download every expense, category, payment mode, and document record as JSON.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={exportData} disabled={exporting}>
            <Download size={14} /> {exporting ? 'Exporting…' : 'Export'}
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Log out of all devices</p>
            <p className="text-xs text-muted">Ends every active session, including this one.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={logoutAllDevices} disabled={loggingOut}>
            <LogOut size={14} /> {loggingOut ? 'Logging out…' : 'Log out everywhere'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
