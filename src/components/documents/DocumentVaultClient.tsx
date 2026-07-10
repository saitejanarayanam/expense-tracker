'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Image as ImageIcon, ExternalLink, Trash2, Loader2, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import type { DocumentRow, Json } from '@/lib/database.types';

interface ExtractedPreview {
  vendor?: string | null;
  amount?: number | null;
  category?: string | null;
}

function getExtracted(data: Json | null): ExtractedPreview | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return data as ExtractedPreview;
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'var(--muted)' },
  processing: { label: 'Processing…', color: 'var(--sunny)' },
  parsed: { label: 'Parsed', color: 'var(--success)' },
  failed: { label: 'Needs review', color: 'var(--danger)' },
};

export function DocumentVaultClient({ currency, dateFormat }: { currency: string; dateFormat: string }) {
  const [documents, setDocuments] = useState<DocumentRow[] | null>(null);
  const [linkedExpenseByDoc, setLinkedExpenseByDoc] = useState<Map<string, string>>(new Map());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRow | null>(null);
  const [removeExpenseToo, setRemoveExpenseToo] = useState(false);

  async function load() {
    setDocuments(null);
    const supabase = createClient();
    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .is('deleted_at', null)
      .order('upload_date', { ascending: false });
    setDocuments(docs || []);

    if (docs && docs.length) {
      const { data: linked } = await supabase
        .from('expenses')
        .select('id, linked_document_id')
        .in('linked_document_id', docs.map((d) => d.id));
      const map = new Map<string, string>();
      (linked || []).forEach((e) => e.linked_document_id && map.set(e.linked_document_id, e.id));
      setLinkedExpenseByDoc(map);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() resets the list to a loading state before refetching
    load();
  }, []);

  async function viewDocument(doc: DocumentRow) {
    const supabase = createClient();
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noreferrer');
  }

  async function retryParse(doc: DocumentRow) {
    setBusyId(doc.id);
    await fetch(`/api/documents/${doc.id}/reparse`, { method: 'POST' });
    setBusyId(null);
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    const supabase = createClient();
    const linkedExpenseId = linkedExpenseByDoc.get(deleteTarget.id);
    if (linkedExpenseId) {
      if (removeExpenseToo) {
        await supabase.from('expenses').update({ deleted_at: new Date().toISOString() }).eq('id', linkedExpenseId);
      } else {
        await supabase.from('expenses').update({ linked_document_id: null }).eq('id', linkedExpenseId);
      }
    }
    await supabase.from('documents').update({ deleted_at: new Date().toISOString() }).eq('id', deleteTarget.id);
    setBusyId(null);
    setDeleteTarget(null);
    setRemoveExpenseToo(false);
    load();
  }

  if (documents === null) {
    return <div className="p-10 text-center text-sm text-muted">Loading…</div>;
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents yet"
        description="Upload a bill or invoice and Spendly's AI will read it for you."
        ctaHref="/expenses/add"
        ctaLabel="Upload a document"
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => {
          const extracted = getExtracted(doc.extracted_data);
          const status = STATUS_STYLE[doc.parsed_status] || STATUS_STYLE.pending;
          const linkedExpenseId = linkedExpenseByDoc.get(doc.id);
          const isImage = doc.mime_type.startsWith('image/');
          return (
            <Card key={doc.id} className="animate-rise flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet/15 text-violet">
                    {isImage ? <ImageIcon size={18} /> : <FileText size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{doc.file_name}</p>
                    <p className="text-xs text-muted">{formatDate(doc.upload_date.slice(0, 10), dateFormat)}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold" style={{ backgroundColor: `${status.color}1f`, color: status.color }}>
                  {status.label}
                </span>
              </div>

              {extracted && (extracted.vendor || extracted.amount) && (
                <div className="rounded-xl bg-[var(--border)]/30 px-3 py-2 text-sm">
                  <p className="font-semibold">{extracted.vendor || 'Unknown vendor'}</p>
                  {extracted.amount != null && <p className="text-muted">{formatCurrency(extracted.amount, currency)}</p>}
                </div>
              )}

              {linkedExpenseId ? (
                <Link href="/expenses" className="text-xs font-semibold text-violet hover:underline">
                  View linked expense →
                </Link>
              ) : (
                <p className="text-xs text-muted">No linked expense</p>
              )}

              <div className="mt-auto flex items-center gap-2 pt-1">
                <Button variant="secondary" size="sm" onClick={() => viewDocument(doc)}>
                  <ExternalLink size={14} /> View
                </Button>
                {doc.parsed_status === 'failed' && (
                  <Button variant="secondary" size="sm" onClick={() => retryParse(doc)} disabled={busyId === doc.id}>
                    {busyId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Retry
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="ml-auto text-danger hover:bg-danger/10" onClick={() => setDeleteTarget(doc)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setDeleteTarget(null)}>
          <div className="card w-full max-w-sm animate-rise p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">Delete this document?</h2>
            <p className="mt-1.5 text-sm text-muted">This cannot be undone.</p>

            {linkedExpenseByDoc.has(deleteTarget.id) && (
              <div className="mt-4 space-y-2 rounded-xl bg-[var(--border)]/30 p-3 text-sm">
                <p className="font-medium">This document is linked to an expense.</p>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={!removeExpenseToo} onChange={() => setRemoveExpenseToo(false)} />
                  Keep the expense, just unlink the document
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={removeExpenseToo} onChange={() => setRemoveExpenseToo(true)} />
                  Delete the linked expense too
                </label>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete} disabled={busyId === deleteTarget.id}>
                {busyId === deleteTarget.id ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
