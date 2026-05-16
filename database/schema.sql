create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  property_type text not null,
  roof_size text,
  service text not null,
  message text,
  contact_time text,
  insurance boolean not null default false,
  page_url text,
  referrer text,
  utm jsonb not null default '{}'::jsonb,
  user_agent text,
  ip_address text,
  status text not null default 'new',
  notes text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;

drop policy if exists "No public lead reads" on public.leads;
drop policy if exists "No public lead writes" on public.leads;

create policy "No public lead reads"
on public.leads for select
to anon, authenticated
using (false);

create policy "No public lead writes"
on public.leads for insert
to anon, authenticated
with check (false);
