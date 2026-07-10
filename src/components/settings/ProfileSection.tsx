'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, Input, Label } from '@/components/ui';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Profile } from '@/lib/database.types';

export function ProfileSection({ profile, email }: { profile: Profile; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from('profiles').update({ name }).eq('id', profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setPasswordSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordError(error.message);
      return;
    }
    setPasswordMsg('Password updated.');
    setNewPassword('');
  }

  async function deleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    const res = await fetch('/api/account/delete', { method: 'POST' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setDeleteError(json.error || 'Could not delete account');
      setDeleting(false);
      return;
    }
    router.push('/login');
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold">Profile</h2>
      <form onSubmit={saveProfile} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={email} disabled className="opacity-60" />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          {saved && <span className="text-sm text-success">Saved!</span>}
        </div>
      </form>

      <hr className="my-6 border-[var(--border)]" />

      <form onSubmit={changePassword} className="space-y-4">
        <h3 className="text-sm font-bold">Change password</h3>
        <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        {passwordError && <p className="text-sm text-danger">{passwordError}</p>}
        {passwordMsg && <p className="text-sm text-success">{passwordMsg}</p>}
        <Button type="submit" variant="secondary" disabled={passwordSaving}>
          {passwordSaving ? 'Updating…' : 'Update password'}
        </Button>
      </form>

      <hr className="my-6 border-[var(--border)]" />

      <div>
        <h3 className="text-sm font-bold text-danger">Danger zone</h3>
        <p className="mt-1 text-sm text-muted">Permanently delete your account and all associated data. This cannot be undone.</p>
        {deleteError && <p className="mt-2 text-sm text-danger">{deleteError}</p>}
        <Button variant="danger" className="mt-3" onClick={() => setConfirmDelete(true)}>
          Delete my account
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        description="This permanently deletes your profile, expenses, categories, and uploaded documents. Consider exporting your data first from the Data & Privacy section below."
        confirmLabel="Delete forever"
        loading={deleting}
        onConfirm={deleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />
    </Card>
  );
}
