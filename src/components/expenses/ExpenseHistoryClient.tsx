'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, RotateCcw, Pencil, Filter, X, ArchiveRestore } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, Input, Select } from '@/components/ui';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EditExpenseModal } from '@/components/expenses/EditExpenseModal';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Category, Expense, PaymentMode } from '@/lib/database.types';

export function ExpenseHistoryClient({
  categories,
  paymentModes,
  currency,
  dateFormat,
}: {
  categories: Category[];
  paymentModes: PaymentMode[];
  currency: string;
  dateFormat: string;
}) {
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Expense | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ type: 'single' | 'bulk' | 'permanent'; id?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categoryByName = useMemo(() => new Map(categories.map((c) => [c.name, c])), [categories]);
  const paymentModeByName = useMemo(() => new Map(paymentModes.map((p) => [p.name, p])), [paymentModes]);

  async function load() {
    setExpenses(null);
    const supabase = createClient();
    let query = supabase.from('expenses').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });
    query = showTrash ? query.not('deleted_at', 'is', null) : query.is('deleted_at', null);
    if (fromDate) query = query.gte('date', fromDate);
    if (toDate) query = query.lte('date', toDate);
    if (categoryFilter) query = query.eq('category', categoryFilter);
    if (paymentModeFilter) query = query.eq('payment_mode', paymentModeFilter);
    if (search.trim()) query = query.or(`vendor.ilike.%${search.trim()}%,notes.ilike.%${search.trim()}%`);
    const { data } = await query.limit(1000);
    setExpenses(data || []);
    setSelected(new Set());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() resets the list to a loading state before refetching
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTrash, fromDate, toDate, categoryFilter, paymentModeFilter]);

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (!expenses) return;
    setSelected((prev) => (prev.size === expenses.length ? new Set() : new Set(expenses.map((e) => e.id))));
  }

  async function softDelete(id: string) {
    setBusy(true);
    const supabase = createClient();
    await supabase.from('expenses').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    setBusy(false);
    setConfirmTarget(null);
    load();
  }

  async function bulkSoftDelete() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from('expenses').update({ deleted_at: new Date().toISOString() }).in('id', Array.from(selected));
    setBusy(false);
    setConfirmTarget(null);
    load();
  }

  async function restore(id: string) {
    const supabase = createClient();
    await supabase.from('expenses').update({ deleted_at: null }).eq('id', id);
    load();
  }

  async function permanentDelete(id: string) {
    setBusy(true);
    const supabase = createClient();
    await supabase.from('expenses').delete().eq('id', id);
    setBusy(false);
    setConfirmTarget(null);
    load();
  }

  const activeFilterCount = [categoryFilter, paymentModeFilter, fromDate, toDate].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendor or notes…" className="pl-9" />
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowFilters((v) => !v)}>
          <Filter size={15} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
        <Button variant={showTrash ? 'primary' : 'secondary'} size="sm" onClick={() => setShowTrash((v) => !v)}>
          <ArchiveRestore size={15} /> {showTrash ? 'Viewing Trash' : 'Trash'}
        </Button>
      </div>

      {showFilters && (
        <Card className="animate-rise grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Category</label>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Payment mode</label>
            <Select value={paymentModeFilter} onChange={(e) => setPaymentModeFilter(e.target.value)}>
              <option value="">All modes</option>
              {paymentModes.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.icon} {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">From</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">To</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setCategoryFilter('');
                setPaymentModeFilter('');
                setFromDate('');
                setToDate('');
              }}
              className="col-span-full flex items-center gap-1 text-xs font-semibold text-violet"
            >
              <X size={13} /> Clear filters
            </button>
          )}
        </Card>
      )}

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-violet/10 px-4 py-2.5 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <Button size="sm" variant="danger" onClick={() => setConfirmTarget({ type: 'bulk' })}>
            <Trash2 size={14} /> Delete selected
          </Button>
        </div>
      )}

      <Card className="overflow-x-auto p-0">
        {expenses === null ? (
          <div className="p-10 text-center text-sm text-muted">Loading…</div>
        ) : expenses.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={showTrash ? 'Trash is empty' : 'No expenses found'}
              description={showTrash ? 'Deleted expenses will show up here for 30 days.' : 'Try adjusting your filters, or add a new expense.'}
              ctaHref={showTrash ? undefined : '/expenses/add'}
              ctaLabel={showTrash ? undefined : 'Add Expense'}
            />
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs font-semibold text-muted">
                <th className="px-4 py-3">
                  <input type="checkbox" checked={selected.size === expenses.length} onChange={toggleSelectAll} className="h-4 w-4 rounded" />
                </th>
                <th className="px-2 py-3">Date</th>
                <th className="px-2 py-3">Vendor</th>
                <th className="px-2 py-3">Category</th>
                <th className="px-2 py-3">Payment Mode</th>
                <th className="px-2 py-3 text-right">Amount</th>
                <th className="px-2 py-3">Source</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => {
                const cat = categoryByName.get(e.category);
                const pm = paymentModeByName.get(e.payment_mode);
                return (
                  <tr key={e.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--border)]/20">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} className="h-4 w-4 rounded" />
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-muted">{formatDate(e.date, dateFormat)}</td>
                    <td className="px-2 py-3 font-medium">{e.vendor || '—'}</td>
                    <td className="px-2 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                        style={{ backgroundColor: `${cat?.color || '#95A5A6'}1a`, color: cat?.color || '#95A5A6' }}
                      >
                        {cat?.icon} {e.category}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                        style={{ backgroundColor: `${pm?.color || '#95A5A6'}1a`, color: pm?.color || '#95A5A6' }}
                      >
                        {pm?.icon} {e.payment_mode}
                      </span>
                      {e.payment_account_label && <div className="mt-0.5 text-[11px] text-muted">{e.payment_account_label}</div>}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-right font-bold">{formatCurrency(Number(e.amount), currency)}</td>
                    <td className="px-2 py-3">
                      <span className={`text-xs ${e.source === 'ai' ? 'text-violet' : 'text-muted'}`}>{e.source === 'ai' ? '✨ AI' : 'Manual'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {showTrash ? (
                          <>
                            <button onClick={() => restore(e.id)} title="Restore" className="rounded-lg p-1.5 text-muted hover:bg-[var(--border)]/50 hover:text-success">
                              <RotateCcw size={15} />
                            </button>
                            <button
                              onClick={() => setConfirmTarget({ type: 'permanent', id: e.id })}
                              title="Delete permanently"
                              className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditing(e)} title="Edit" className="rounded-lg p-1.5 text-muted hover:bg-[var(--border)]/50 hover:text-violet">
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setConfirmTarget({ type: 'single', id: e.id })}
                              title="Delete"
                              className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {editing && (
        <EditExpenseModal
          expense={editing}
          categories={categories}
          paymentModes={paymentModes}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      <ConfirmDialog
        open={confirmTarget?.type === 'single'}
        title="Delete this expense?"
        description="It will move to Trash and be permanently removed after 30 days. You can restore it any time before then."
        loading={busy}
        onConfirm={() => confirmTarget?.id && softDelete(confirmTarget.id)}
        onCancel={() => setConfirmTarget(null)}
      />
      <ConfirmDialog
        open={confirmTarget?.type === 'bulk'}
        title={`Delete ${selected.size} expenses?`}
        description="They will move to Trash and be permanently removed after 30 days."
        loading={busy}
        onConfirm={bulkSoftDelete}
        onCancel={() => setConfirmTarget(null)}
      />
      <ConfirmDialog
        open={confirmTarget?.type === 'permanent'}
        title="Permanently delete this expense?"
        description="This cannot be undone."
        confirmLabel="Delete forever"
        loading={busy}
        onConfirm={() => confirmTarget?.id && permanentDelete(confirmTarget.id)}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
