-- Recruitly database migration
-- Written against the EXISTING schema already in this Supabase project
-- (confirmed via supabase/inspection.sql before writing this file).
--
-- This is 100% ADDITIVE and safe to run more than once:
--   - No existing table, column, or row is dropped, renamed, or overwritten.
--   - No existing column's type or constraints are altered.
--   - The only two statements that touch data (marked below) are UPDATEs
--     that fill brand-new columns ONLY where they are currently NULL -
--     they never overwrite a value that's already there.
--   - Every statement is idempotent (add column IF NOT EXISTS, create or
--     replace function, drop policy IF EXISTS before each create policy),
--     so re-running this file is harmless.
--
-- Run once in the Supabase SQL Editor (Project -> SQL Editor -> New query).

-- ============================================================
-- 1. New columns
-- All nullable, so adding them to tables that already have rows is safe -
-- existing rows simply get NULL in the new column until backfilled below.
-- ============================================================

-- Candidates need to know which company they belong to directly (not only
-- via their job), because a candidate can exist without a job assigned yet.
alter table candidates add column if not exists company_id bigint references companies(id);
alter table candidates add column if not exists phone text;
alter table candidates add column if not exists notes text;

-- Needed so the admin "Users" page can list an account's email without a
-- privileged server call for every page view.
alter table profiles add column if not exists email text;

-- ============================================================
-- 2. Backfill (the only data-touching statements in this file)
-- Both only fill rows where the NEW column is currently NULL - existing
-- values in any other column are never read or changed.
-- ============================================================

-- Give existing candidates the company_id of the job they're already linked to.
update candidates c
set company_id = j.company_id
from jobs j
where c.job_id = j.id
  and c.company_id is null;

-- Copy each user's email from auth.users (source of truth) into their profile.
update profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;

-- ============================================================
-- 3. Helper functions used by the RLS policies below.
-- Prefixed with recruitly_ so they can't collide with any existing or
-- built-in Postgres function (e.g. the SQL-standard `current_role`).
-- security definer + fixed search_path so they can read `profiles`
-- regardless of the calling user's own row-level policies.
-- ============================================================
create or replace function public.recruitly_current_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.recruitly_current_company_id()
returns bigint
language sql stable security definer
set search_path = public
as $$
  select company_id from profiles where id = auth.uid();
$$;

-- ============================================================
-- 4. Row Level Security policies.
-- RLS is already enabled on all 4 tables in this project, but had NO
-- policies defined - which means nobody (except the service_role key)
-- could read or write anything. These policies fix that:
-- admins get full access, customers are scoped to their own company_id.
-- Each policy is dropped first (if it exists) so this file can be re-run.
-- ============================================================

-- companies
drop policy if exists "companies_select" on companies;
create policy "companies_select" on companies for select
  using (id = recruitly_current_company_id() or recruitly_current_role() = 'admin');

drop policy if exists "companies_admin_write" on companies;
create policy "companies_admin_write" on companies for all
  using (recruitly_current_role() = 'admin')
  with check (recruitly_current_role() = 'admin');

-- profiles
drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles for select
  using (id = auth.uid() or recruitly_current_role() = 'admin');

drop policy if exists "profiles_update" on profiles;
create policy "profiles_update" on profiles for update
  using (id = auth.uid() or recruitly_current_role() = 'admin');
-- No client-side insert policy: accounts are created via the create-user
-- Edge Function using the service role key, which bypasses RLS.

-- jobs
drop policy if exists "jobs_select" on jobs;
create policy "jobs_select" on jobs for select
  using (company_id = recruitly_current_company_id() or recruitly_current_role() = 'admin');

drop policy if exists "jobs_insert" on jobs;
create policy "jobs_insert" on jobs for insert
  with check (company_id = recruitly_current_company_id() or recruitly_current_role() = 'admin');

drop policy if exists "jobs_update" on jobs;
create policy "jobs_update" on jobs for update
  using (company_id = recruitly_current_company_id() or recruitly_current_role() = 'admin');

drop policy if exists "jobs_delete" on jobs;
create policy "jobs_delete" on jobs for delete
  using (company_id = recruitly_current_company_id() or recruitly_current_role() = 'admin');

-- candidates
drop policy if exists "candidates_select" on candidates;
create policy "candidates_select" on candidates for select
  using (company_id = recruitly_current_company_id() or recruitly_current_role() = 'admin');

drop policy if exists "candidates_insert" on candidates;
create policy "candidates_insert" on candidates for insert
  with check (company_id = recruitly_current_company_id() or recruitly_current_role() = 'admin');

drop policy if exists "candidates_update" on candidates;
create policy "candidates_update" on candidates for update
  using (company_id = recruitly_current_company_id() or recruitly_current_role() = 'admin');

drop policy if exists "candidates_delete" on candidates;
create policy "candidates_delete" on candidates for delete
  using (company_id = recruitly_current_company_id() or recruitly_current_role() = 'admin');
