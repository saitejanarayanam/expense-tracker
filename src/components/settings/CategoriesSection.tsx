'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, Input, Select } from '@/components/ui';
import type { Category } from '@/lib/database.types';

export function CategoriesSection({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💸');
  const [color, setColor] = useState('#6C5CE7');
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editColor, setEditColor] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [reassignTo, setReassignTo] = useState('');

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from('categories').insert({ user_id: user!.id, name: name.trim(), icon, color });
    setAdding(false);
    if (error) {
      setError(error.message.includes('duplicate') ? 'A category with this name already exists' : error.message);
      return;
    }
    setName('');
    router.refresh();
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditIcon(c.icon);
    setEditColor(c.color);
  }

  async function saveEdit(id: string) {
    const supabase = createClient();
    await supabase.from('categories').update({ name: editName, icon: editIcon, color: editColor }).eq('id', id);
    setEditingId(null);
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const supabase = createClient();
    const target = reassignTo || categories.find((c) => c.id !== deleteTarget.id)?.name || 'Others';
    await supabase.from('expenses').update({ category: target }).eq('category', deleteTarget.name);
    await supabase.from('categories').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold">Categories</h2>
      <div className="mb-4 space-y-2">
        {categories.map((c) =>
          editingId === c.id ? (
            <div key={c.id} className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-2">
              <Input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="w-14 text-center" maxLength={2} />
              <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="h-9 w-9 rounded" />
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
              <button onClick={() => saveEdit(c.id)} className="rounded-lg p-1.5 text-success hover:bg-success/10">
                <Check size={16} />
              </button>
              <button onClick={() => setEditingId(null)} className="rounded-lg p-1.5 text-muted hover:bg-[var(--border)]/50">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] p-2.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
                  style={{ backgroundColor: `${c.color}1f` }}
                >
                  {c.icon}
                </span>
                {c.name}
              </span>
              <div className="flex gap-1">
                <button onClick={() => startEdit(c)} className="rounded-lg p-1.5 text-muted hover:bg-[var(--border)]/50 hover:text-violet">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <form onSubmit={addCategory} className="flex items-center gap-2">
        <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-14 text-center" maxLength={2} />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-9 rounded" />
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" className="flex-1" />
        <Button type="submit" size="sm" disabled={adding}>
          <Plus size={15} />
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setDeleteTarget(null)}>
          <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold">Delete &quot;{deleteTarget.name}&quot;?</h3>
            <p className="mt-1.5 text-sm text-muted">Expenses in this category will be reassigned.</p>
            <div className="mt-3">
              <Select value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
                <option value="">Reassign to…</option>
                {categories.filter((c) => c.id !== deleteTarget.id).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
