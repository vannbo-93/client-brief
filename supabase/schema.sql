-- =========================================================
-- Client Brief - Database schema
-- Run in Supabase SQL Editor, top to bottom, on a new project.
-- Keep this file in sync with the live database.
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

  -- Answers to the conditional questions (lib/brief-questions.ts)
  details jsonb not null default '{}'::jsonb,

  reference_sites text[] not null default '{}',

  budget_range text not null
    check (budget_range in ('under_300', '300_700', '700_1500', '1500_3000', '3000_plus', 'not_sure')),
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

-- ---------- Rate limiting ----------
-- Index used by the rate limit checks below
create index if not exists briefs_email_created_at_idx
  on public.briefs (client_email, created_at desc);

-- Rejects an insert if:
--   - the same email sent 3+ briefs in the last 24 hours
--   - 30+ briefs were sent by anyone in the last hour
-- security definer: needs to count rows that anon can't read
create or replace function public.limit_brief_submissions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.briefs
    where client_email = new.client_email
      and created_at > now() - interval '24 hours'
  ) >= 3 then
    raise exception 'Too many briefs from this email'
      using errcode = 'P0001', hint = 'rate_limit_email';
  end if;

  if (
    select count(*) from public.briefs
    where created_at > now() - interval '1 hour'
  ) >= 30 then
    raise exception 'Too many briefs overall'
      using errcode = 'P0001', hint = 'rate_limit_global';
  end if;

  return new;
end;
$$;

create trigger briefs_rate_limit
  before insert on public.briefs
  for each row
  execute function public.limit_brief_submissions();

-- ---------- Admin access ----------
-- Only users listed here can read and update briefs.
-- RLS enabled with no policies = not reachable through the API.
-- Add admins manually from the SQL Editor:
--   insert into public.admins (user_id)
--   select id from auth.users where email = '<admin email>';
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Is the current user an admin?
-- security definer: reads the admins table, which nobody can query directly
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where user_id = (select auth.uid())
  );
$$;

create policy "Admins can read briefs"
  on public.briefs
  for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can update briefs"
  on public.briefs
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Logged-in users can only update the status column,
-- never the client's data, even if the app code has a bug.
revoke update on public.briefs from authenticated;
grant update (status) on public.briefs to authenticated;