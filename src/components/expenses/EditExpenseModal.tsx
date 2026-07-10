'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Label, Select, Textarea } from '@/components/ui';
import type { Category, Expense, PaymentMode } from '@/lib/database.types';

export function EditExpenseModal({
  expense,
  categories,
  paymentModes,
  onClose,
  onSaved,
}: {
  expense: Expense;
  categories: Category[];
  paymentModes: PaymentMode[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category);
  const [date, setDate] = useState(expense.date);
  const [paymentMode, setPaymentMode] = useState(expense.payment_mode);
  const [paymentAccountLabel, setPaymentAccountLabel] = useState(expense.payment_account_label || '');
  const [vendor, setVendor] = useState(expense.vendor || '');
  const [notes, setNotes] = useState(expense.notes || '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from('expenses')
      .update({
        amount: amountNum,
        category,
        date,
        payment_mode: paymentMode,
        payment_account_label: paymentAccountLabel || null,
        vendor: vendor || null,
        notes: notes || null,
      })
      .eq('id', expense.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="card w-full max-w-md animate-rise p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit Expense</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-[var(--border)]/50">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-amount">Amount</Label>
              <Input id="edit-amount" type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-payment">Payment Mode</Label>
              <Select id="edit-payment" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                {paymentModes.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.icon} {p.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-vendor">Vendor</Label>
              <Input id="edit-vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-label">Card / Account label</Label>
              <Input id="edit-label" value={paymentAccountLabel} onChange={(e) => setPaymentAccountLabel(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
