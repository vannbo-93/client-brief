-- =========================================================
-- Client Brief - Database schema
-- Run in Supabase SQL Editor
-- =========================================================

-- ---------- Table: briefs ----------
create table public.briefs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  status text not null default 'new'
    check (status in ('new', 'reviewing', 'accepted', 'rejected')),

  client_name  text not null check (char_length(client_name) between 2 and 100),
  client_email text not null check (char_length(client_email) <= 200),
  company      text check (char_length(company) <= 150),

  project_type text not null
    check (project_type in ('landing', 'portfolio', 'business', 'ecommerce', 'web_app', 'other')),

  description text not null check (char_length(description) between 20 and 5000),

  details jsonb not null default '{}'::jsonb,

  reference_sites text[] not null default '{}',

  budget_range text not null
    check (budget_range in ('under_300', '300_700', '700_1500', '1500_plus', 'not_sure')),
  timeline text not null
    check (timeline in ('asap', '1_month', '2_3_months', 'flexible')),

  notes text check (char_length(notes) <= 3000)
);

-- ---------- Row Level Security ----------
alter table public.briefs enable row level security;

-- Visitors (anon) can only INSERT new briefs. No read/update/delete.
create policy "Visitors can submit briefs"
  on public.briefs
  for insert
  to anon
  with check (status = 'new');

-- Admin policies (select/update) will be added in Phase 5.
-- ---------- Rate limiting ----------
select tgname from pg_trigger where tgrelid = 'public.briefs'::regclass and not tgisinternal;