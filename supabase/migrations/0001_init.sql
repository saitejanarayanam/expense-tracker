-- Extensions
create extension if not exists pgcrypto;

-- =========================================================
-- Profiles (1:1 with auth.users)
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text,
  currency text not null default 'INR',
  date_format text not null default 'DD/MM/YYYY',
  default_view text not null default 'monthly',
  theme text not null default 'vibrant',
  dark_mode boolean not null default false,
  auto_approve_ai boolean not null default false,
  daily_reminder boolean not null default false,
  reminder_time text default '20:00',
  budget_alerts boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- =========================================================
-- Categories
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '💸',
  color text not null default '#6C5CE7',
  is_default boolean not null default false,
  monthly_budget numeric(12,2),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.categories enable row level security;

create policy "categories_all_own" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_categories_user on public.categories(user_id);

-- =========================================================
-- Payment modes
-- =========================================================
create table if not exists public.payment_modes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '💳',
  color text not null default '#00B894',
  label text,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.payment_modes enable row level security;

create policy "payment_modes_all_own" on public.payment_modes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_payment_modes_user on public.payment_modes(user_id);

-- =========================================================
-- Documents
-- =========================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size integer not null,
  upload_date timestamptz not null default now(),
  parsed_status text not null default 'pending', -- pending | processing | parsed | failed
  extracted_data jsonb,
  deleted_at timestamptz
);

alter table public.documents enable row level security;

create policy "documents_all_own" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_documents_user on public.documents(user_id);

-- =========================================================
-- Expenses
-- =========================================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  category text not null,
  date date not null,
  payment_mode text not null,
  payment_account_label text,
  vendor text,
  notes text,
  is_recurring boolean not null default false,
  recurrence_interval text, -- weekly | monthly | yearly
  source text not null default 'manual', -- manual | ai
  ai_confidence jsonb,
  linked_document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.expenses enable row level security;

create policy "expenses_all_own" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_expenses_user on public.expenses(user_id);
create index if not exists idx_expenses_user_date on public.expenses(user_id, date);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- =========================================================
-- Saved reports
-- =========================================================
create table if not exists public.saved_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.saved_reports enable row level security;

create policy "saved_reports_all_own" on public.saved_reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- New user bootstrap: profile + default categories/payment modes
-- =========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email);

  insert into public.categories (user_id, name, icon, color, is_default) values
    (new.id, 'Food', '🍔', '#FF6B6B', true),
    (new.id, 'Travel', '✈️', '#4D96FF', true),
    (new.id, 'Shopping', '🛍️', '#FFA502', true),
    (new.id, 'Bills/Utilities', '🧾', '#6C5CE7', true),
    (new.id, 'Health', '💊', '#00B894', true),
    (new.id, 'Entertainment', '🎬', '#FF6FB5', true),
    (new.id, 'Others', '📦', '#95A5A6', true);

  insert into public.payment_modes (user_id, name, icon, color, is_default, sort_order) values
    (new.id, 'Cash', '💵', '#2ECC71', true, 0),
    (new.id, 'Bank Transfer', '🏦', '#3498DB', true, 1),
    (new.id, 'Credit Card', '💳', '#E74C3C', true, 2),
    (new.id, 'Debit Card', '💳', '#9B59B6', true, 3),
    (new.id, 'UPI', '📲', '#F39C12', true, 4),
    (new.id, 'Digital Wallet', '👛', '#1ABC9C', true, 5),
    (new.id, 'Cheque', '📝', '#7F8C8D', true, 6),
    (new.id, 'Other', '❓', '#34495E', true, 7);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- Storage bucket for uploaded documents (private)
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760, array['application/pdf','image/jpeg','image/jpg','image/png'])
on conflict (id) do nothing;

create policy "documents_bucket_select_own"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "documents_bucket_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "documents_bucket_delete_own"
  on storage.objects for delete
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
