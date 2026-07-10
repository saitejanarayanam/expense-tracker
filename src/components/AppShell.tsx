'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { createClient } from '@/lib/supabase/client';
import { Plus, LayoutDashboard, ListChecks, FileStack, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expense History', icon: ListChecks },
  { href: '/documents', label: 'Document Vault', icon: FileStack },
  { href: '/reports', label: 'Reports & Insights', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ name, children }: { name: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initial = (name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="gradient-brand h-7 w-7 rounded-lg" />
          <span className="font-extrabold">Spendly</span>
        </Link>
        <button onClick={() => setMobileOpen((v) => !v)} className="rounded-lg p-2 hover:bg-[var(--border)]/50">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--border)] px-4 py-6 md:flex">
          <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
            <span className="gradient-brand h-8 w-8 rounded-xl" />
            <span className="text-lg font-extrabold tracking-tight">Spendly</span>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    active ? 'bg-violet text-white shadow-md shadow-violet/25' : 'text-foreground hover:bg-[var(--border)]/50'
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/expenses/add"
            className="mb-3 flex items-center justify-center gap-2 rounded-full bg-coral px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-coral/25 hover:brightness-105"
          >
            <Plus size={18} /> Add Expense
          </Link>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet/15 text-sm font-bold text-violet">
              {initial}
            </div>
            <span className="flex-1 truncate text-sm font-medium">{name}</span>
            <button onClick={handleLogout} title="Log out" className="rounded-lg p-1.5 text-muted hover:bg-[var(--border)]/50 hover:text-danger">
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* Mobile menu overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)}>
            <aside
              className="flex h-full w-72 flex-col gap-1 bg-[var(--surface)] px-4 py-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                      active ? 'bg-violet text-white' : 'text-foreground hover:bg-[var(--border)]/50'
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/expenses/add"
                onClick={() => setMobileOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 rounded-full bg-coral px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={18} /> Add Expense
              </Link>
              <button
                onClick={handleLogout}
                className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger/10"
              >
                <LogOut size={18} /> Log out
              </button>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="min-h-screen flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      {/* Mobile FAB */}
      <Link
        href="/expenses/add"
        className="fixed bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-coral text-white shadow-xl shadow-coral/30 md:hidden"
      >
        <Plus size={26} />
      </Link>
    </div>
  );
}
