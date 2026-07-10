'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, Input } from '@/components/ui';
import type { Profile } from '@/lib/database.types';

export function NotificationsAISection({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [dailyReminder, setDailyReminder] = useState(profile.daily_reminder);
  const [reminderTime, setReminderTime] = useState(profile.reminder_time || '20:00');
  const [budgetAlerts, setBudgetAlerts] = useState(profile.budget_alerts);
  const [autoApprove, setAutoApprove] = useState(profile.auto_approve_ai);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({
        daily_reminder: dailyReminder,
        reminder_time: reminderTime,
        budget_alerts: budgetAlerts,
        auto_approve_ai: autoApprove,
      })
      .eq('id', profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold">Notifications &amp; AI Behavior</h2>
      <form onSubmit={save} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Daily reminder to log expenses</p>
            <p className="text-xs text-muted">Get nudged if you haven&apos;t logged anything today.</p>
          </div>
          <input type="checkbox" checked={dailyReminder} onChange={(e) => setDailyReminder(e.target.checked)} className="h-4 w-4 rounded" />
        </div>
        {dailyReminder && (
          <div className="flex items-center gap-2 pl-1">
            <span className="text-xs text-muted">Remind me at</span>
            <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-32" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Budget threshold alerts</p>
            <p className="text-xs text-muted">Warn me when I&apos;m close to a category budget.</p>
          </div>
          <input type="checkbox" checked={budgetAlerts} onChange={(e) => setBudgetAlerts(e.target.checked)} className="h-4 w-4 rounded" />
        </div>

        <hr className="border-[var(--border)]" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Auto-approve high-confidence AI extractions</p>
            <p className="text-xs text-muted">
              When off (default), you always review AI-scanned fields before saving. When on, high-confidence fields are pre-approved (you can still edit them).
            </p>
          </div>
          <input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} className="h-4 w-4 shrink-0 rounded" />
        </div>

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
