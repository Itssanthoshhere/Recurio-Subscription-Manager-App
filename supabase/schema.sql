-- Supabase Schema for Recurio
-- Run this in the Supabase SQL Editor

-- 1. Create a function to extract the Clerk user ID from the JWT
create or replace function requesting_user_id()
returns text
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;

-- 2. Create the subscriptions table
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default requesting_user_id(),
  name text not null,
  price numeric not null,
  currency text not null default 'INR',
  billing text not null default 'Monthly', -- e.g., 'Monthly', 'Yearly', 'Weekly'
  category text,
  status text not null default 'active', -- 'active', 'paused', 'cancelled'
  start_date timestamp with time zone,
  renewal_date timestamp with time zone,
  payment_method text,
  notes text,
  color text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.subscriptions enable row level security;

-- 4. Create RLS Policies linking to Clerk user_id
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (requesting_user_id() = user_id);

create policy "Users can insert their own subscriptions"
  on public.subscriptions for insert
  with check (requesting_user_id() = user_id);

create policy "Users can update their own subscriptions"
  on public.subscriptions for update
  using (requesting_user_id() = user_id)
  with check (requesting_user_id() = user_id);

create policy "Users can delete their own subscriptions"
  on public.subscriptions for delete
  using (requesting_user_id() = user_id);

-- 5. Automatically update the updated_at timestamp
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.subscriptions
  for each row execute procedure moddatetime (updated_at);
