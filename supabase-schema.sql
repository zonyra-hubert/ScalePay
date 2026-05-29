-- Supabase Schema Setup for Expense Tracker

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  currency text default 'GHS',
  theme text default 'dark' check (theme in ('light', 'dark', 'system')),
  email_alerts boolean default true,
  monthly_summary boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. TRANSACTIONS TABLE
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  amount numeric(12,2) not null,
  date date not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for transactions
alter table public.transactions enable row level security;

create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions" on public.transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete own transactions" on public.transactions
  for delete using (auth.uid() = user_id);

-- 3. BUDGETS TABLE
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  limit_amount numeric(12,2) not null,
  month text not null, -- format YYYY-MM
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint budgets_user_category_month_key unique (user_id, category, month)
);

-- Enable RLS for budgets
alter table public.budgets enable row level security;

create policy "Users can view own budgets" on public.budgets
  for select using (auth.uid() = user_id);

create policy "Users can insert own budgets" on public.budgets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own budgets" on public.budgets
  for update using (auth.uid() = user_id);

create policy "Users can delete own budgets" on public.budgets
  for delete using (auth.uid() = user_id);
