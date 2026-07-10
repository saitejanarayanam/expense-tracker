'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, Check, X, ArrowUp, ArrowDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, Input } from '@/components/ui';
import type { PaymentMode } from '@/lib/database.types';

export function PaymentModesSection({ paymentModes }: { paymentModes: PaymentMode[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💳');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editLabel, setEditLabel] = useState('');

  const sorted = [...paymentModes].sort((a, b) => a.sort_order - b.sort_order);

  async function addMode(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const maxOrder = Math.max(-1, ...paymentModes.map((p) => p.sort_order));
    const { error } = await supabase
      .from('payment_modes')
      .insert({ user_id: user!.id, name: name.trim(), icon, label: label.trim() || null, sort_order: maxOrder + 1 });
    setAdding(false);
    if (error) {
      setError(error.message);
      return;
    }
    setName('');
    setLabel('');
    router.refresh();
  }

  function startEdit(p: PaymentMode) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditIcon(p.icon);
    setEditLabel(p.label || '');
  }

  async function saveEdit(id: string) {
    const supabase = createClient();
    await supabase.from('payment_modes').update({ name: editName, icon: editIcon, label: editLabel || null }).eq('id', id);
    setEditingId(null);
    router.refresh();
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from('payment_modes').delete().eq('id', id);
    router.refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const target = sorted[index + dir];
    const current = sorted[index];
    if (!target) return;
    const supabase = createClient();
    await Promise.all([
      supabase.from('payment_modes').update({ sort_order: target.sort_order }).eq('id', current.id),
      supabase.from('payment_modes').update({ sort_order: current.sort_order }).eq('id', target.id),
    ]);
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold">Payment Modes</h2>
      <div className="mb-4 space-y-2">
        {sorted.map((p, i) =>
          editingId === p.id ? (
            <div key={p.id} className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-2">
              <Input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="w-14 text-center" maxLength={2} />
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
              <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Label" className="w-40" />
              <button onClick={() => saveEdit(p.id)} className="rounded-lg p-1.5 text-success hover:bg-success/10">
                <Check size={16} />
              </button>
              <button onClick={() => setEditingId(null)} className="rounded-lg p-1.5 text-muted hover:bg-[var(--border)]/50">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] p-2.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="text-base">{p.icon}</span>
                {p.name}
                {p.label && <span className="text-xs text-muted">({p.label})</span>}
              </span>
              <div className="flex gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg p-1.5 text-muted hover:bg-[var(--border)]/50 disabled:opacity-30">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === sorted.length - 1} className="rounded-lg p-1.5 text-muted hover:bg-[var(--border)]/50 disabled:opacity-30">
                  <ArrowDown size={14} />
                </button>
                <button onClick={() => startEdit(p)} className="rounded-lg p-1.5 text-muted hover:bg-[var(--border)]/50 hover:text-violet">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(p.id)} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <form onSubmit={addMode} className="flex items-center gap-2">
        <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-14 text-center" maxLength={2} />
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New payment mode" className="flex-1" />
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label e.g. HDFC ••••4821" className="w-48" />
        <Button type="submit" size="sm" disabled={adding}>
          <Plus size={15} />
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </Card>
  );
}
