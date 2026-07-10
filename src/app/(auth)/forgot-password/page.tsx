'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, Input, Label } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="animate-rise text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal/15 text-2xl">✉️</div>
        <h1 className="text-xl font-extrabold">Reset link sent</h1>
        <p className="mt-2 text-sm text-muted">
          If an account exists for <span className="font-medium text-foreground">{email}</span>, a password reset link is on
          its way.
        </p>
        <Link href="/login" className="mt-6 inline-block font-semibold text-violet hover:underline">
          Back to login
        </Link>
      </Card>
    );
  }

  return (
    <Card className="animate-rise">
      <h1 className="text-2xl font-extrabold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted">We&apos;ll email you a link to set a new one.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-violet hover:underline">
          Back to login
        </Link>
      </p>
    </Card>
  );
}
