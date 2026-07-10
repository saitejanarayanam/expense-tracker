'use client';

import { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' && 'px-3.5 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-7 py-3.5 text-base',
        variant === 'primary' && 'bg-violet text-white shadow-lg shadow-violet/25 hover:brightness-110',
        variant === 'secondary' && 'bg-[var(--surface)] border border-[var(--border)] text-foreground hover:bg-[var(--border)]/40',
        variant === 'ghost' && 'text-foreground hover:bg-[var(--border)]/40',
        variant === 'danger' && 'bg-danger text-white hover:brightness-110',
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition',
        'focus:border-violet focus:ring-2 focus:ring-violet/20',
        'placeholder:text-muted',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition',
        'focus:border-violet focus:ring-2 focus:ring-violet/20',
        'placeholder:text-muted',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition',
        'focus:border-violet focus:ring-2 focus:ring-violet/20',
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={clsx('mb-1.5 block text-sm font-medium text-foreground', className)} {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('card p-6', className)} {...props} />;
}

export function Badge({
  className,
  color,
  children,
}: {
  className?: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', className)}
      style={color ? { backgroundColor: `${color}1a`, color } : undefined}
    >
      {children}
    </span>
  );
}
