'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, Label, Select } from '@/components/ui';
import type { Profile } from '@/lib/database.types';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export function PreferencesSection({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [currency, setCurrency] = useState(profile.currency);
  const [dateFormat, setDateFormat] = useState(profile.date_format);
  const [defaultView, setDefaultView] = useState(profile.default_view);
  const [darkMode, setDarkMode] = useState(profile.dark_mode);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ currency, date_format: dateFormat, default_view: defaultView, dark_mode: darkMode })
      .eq('id', profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold">Preferences</h2>
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Currency</Label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Date format</Label>
            <Select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </Select>
          </div>
        </div>
        <div>
          <Label>Default dashboard view</Label>
          <Select value={defaultView} onChange={(e) => setDefaultView(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="h-4 w-4 rounded" />
          Dark mode
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          {saved && <span className="text-sm text-success">Saved!</span>}
        </div>
      </form>
    </Card>
  );
}
