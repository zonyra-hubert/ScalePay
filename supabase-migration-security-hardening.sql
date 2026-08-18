-- ==============================================================================
-- ScalePay - Non-Destructive Security Migration
-- Apply this script to existing Supabase databases to harden security
-- without dropping tables or losing user data.
-- ==============================================================================

begin;

-- 1. Ensure pgcrypto extension
create extension if not exists "pgcrypto";

-- 2. Revoke default public execution privileges
revoke execute on all functions in schema public from public;

-- ------------------------------------------------------------------------------
-- 3. PROFILES TABLE HARDENING
-- ------------------------------------------------------------------------------
alter table if exists public.profiles enable row level security;

-- Add constraints conditionally if they don't already exist
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_theme_check') then
    alter table public.profiles add constraint profiles_theme_check check (theme in ('light', 'dark', 'system'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_currency_check') then
    alter table public.profiles add constraint profiles_currency_check check (length(currency) between 2 and 10);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_full_name_check') then
    alter table public.profiles add constraint profiles_full_name_check check (full_name is null or (length(trim(full_name)) > 0 and length(full_name) <= 100));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_avatar_url_check') then
    alter table public.profiles add constraint profiles_avatar_url_check check (avatar_url is null or (length(avatar_url) <= 2048 and avatar_url ~* '^https?://.*'));
  end if;
end $$;

-- Drop and recreate profiles RLS policies with full WITH CHECK constraints
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can delete own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 4. TRANSACTIONS TABLE HARDENING
-- ------------------------------------------------------------------------------
alter table if exists public.transactions enable row level security;

-- Set default user_id to auth.uid()
alter table public.transactions alter column user_id set default auth.uid();

-- Add constraints conditionally
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'transactions_type_check') then
    alter table public.transactions add constraint transactions_type_check check (type in ('income', 'expense'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'transactions_amount_check') then
    alter table public.transactions add constraint transactions_amount_check check (amount > 0 and amount <= 999999999.99);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'transactions_title_check') then
    alter table public.transactions add constraint transactions_title_check check (length(trim(title)) > 0 and length(title) <= 255);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'transactions_category_check') then
    alter table public.transactions add constraint transactions_category_check check (length(trim(category)) > 0 and length(category) <= 100);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'transactions_description_check') then
    alter table public.transactions add constraint transactions_description_check check (description is null or length(description) <= 1000);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'transactions_date_check') then
    alter table public.transactions add constraint transactions_date_check check (date >= '1970-01-01' and date <= (current_date + interval '1 year'));
  end if;
end $$;

-- Drop and recreate transactions RLS policies
drop policy if exists "Users can view own transactions" on public.transactions;
drop policy if exists "Users can insert own transactions" on public.transactions;
drop policy if exists "Users can update own transactions" on public.transactions;
drop policy if exists "Users can delete own transactions" on public.transactions;

create policy "Users can view own transactions"
  on public.transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Performance and DoS mitigation indexes
create index if not exists idx_transactions_user_id_date on public.transactions (user_id, date desc, created_at desc);
create index if not exists idx_transactions_user_id_category on public.transactions (user_id, category);

-- ------------------------------------------------------------------------------
-- 5. BUDGETS TABLE HARDENING
-- ------------------------------------------------------------------------------
alter table if exists public.budgets enable row level security;

-- Set default user_id to auth.uid()
alter table public.budgets alter column user_id set default auth.uid();

-- Add constraints conditionally
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'budgets_limit_amount_check') then
    alter table public.budgets add constraint budgets_limit_amount_check check (limit_amount >= 0 and limit_amount <= 999999999.99);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'budgets_category_check') then
    alter table public.budgets add constraint budgets_category_check check (length(trim(category)) > 0 and length(category) <= 100);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'budgets_month_format_check') then
    alter table public.budgets add constraint budgets_month_format_check check (month ~ '^\d{4}-(0[1-9]|1[0-2])$');
  end if;
end $$;

-- Drop and recreate budgets RLS policies
drop policy if exists "Users can view own budgets" on public.budgets;
drop policy if exists "Users can insert own budgets" on public.budgets;
drop policy if exists "Users can update own budgets" on public.budgets;
drop policy if exists "Users can delete own budgets" on public.budgets;

create policy "Users can view own budgets"
  on public.budgets
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own budgets"
  on public.budgets
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on public.budgets
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on public.budgets
  for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_budgets_user_id_month on public.budgets (user_id, month);

-- ------------------------------------------------------------------------------
-- 6. SECURITY DEFINER FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- Trigger 1: Timestamp updater with empty search_path
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Trigger 2: Automated profile creation on auth.users with empty search_path
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  default_name text;
begin
  default_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    split_part(coalesce(new.email, 'User'), '@', 1)
  );

  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    currency,
    theme,
    email_alerts,
    monthly_summary
  )
  values (
    new.id,
    coalesce(new.email, ''),
    substring(default_name from 1 for 100),
    case
      when (new.raw_user_meta_data->>'avatar_url') ~* '^https?://.*'
      then new.raw_user_meta_data->>'avatar_url'
      else null
    end,
    'GHS',
    'dark',
    true,
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant execute on function public.handle_updated_at() to authenticated, service_role;
grant execute on function public.handle_new_user() to service_role;

-- ------------------------------------------------------------------------------
-- 7. STORAGE BUCKET SECURITY
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'financial_documents',
  'financial_documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/csv']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatars public read" on storage.objects;
create policy "Avatars public read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can view own financial documents" on storage.objects;
create policy "Users can view own financial documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'financial_documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can upload own financial documents" on storage.objects;
create policy "Users can upload own financial documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'financial_documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own financial documents" on storage.objects;
create policy "Users can update own financial documents"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'financial_documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'financial_documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own financial documents" on storage.objects;
create policy "Users can delete own financial documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'financial_documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

commit;
