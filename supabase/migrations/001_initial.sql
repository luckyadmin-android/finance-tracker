-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories table
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null default '#6366f1',
  created_at timestamptz default now() not null
);

-- Transactions table
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  description text not null,
  date date not null,
  created_at timestamptz default now() not null
);

-- Row Level Security
alter table categories enable row level security;
alter table transactions enable row level security;

-- Categories RLS policies
create policy "Users can view own categories"
  on categories for select using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on categories for insert with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on categories for update using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on categories for delete using (auth.uid() = user_id);

-- Transactions RLS policies
create policy "Users can view own transactions"
  on transactions for select using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on transactions for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on transactions for update using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on transactions for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists transactions_user_id_idx on transactions(user_id);
create index if not exists transactions_date_idx on transactions(date desc);
create index if not exists transactions_type_idx on transactions(type);
create index if not exists categories_user_id_idx on categories(user_id);
