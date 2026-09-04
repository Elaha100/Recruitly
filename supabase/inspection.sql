-- Read-only inspection query.
-- Does NOT modify, delete, or read any rows from companies/profiles/jobs/candidates.
-- It only inspects table/column/policy DEFINITIONS (schema metadata).
--
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste this whole file -> Run.
-- Copy the single JSON result back to share it.

select json_build_object(
  'columns', (
    select json_agg(row_to_json(t)) from (
      select table_name, column_name, data_type, is_nullable, column_default
      from information_schema.columns
      where table_schema = 'public'
        and table_name in ('companies','profiles','jobs','candidates')
      order by table_name, ordinal_position
    ) t
  ),
  'constraints', (
    select json_agg(row_to_json(t)) from (
      select conname, conrelid::regclass::text as table_name, pg_get_constraintdef(oid) as definition
      from pg_constraint
      where connamespace = 'public'::regnamespace
      order by table_name
    ) t
  ),
  'enums', (
    select json_agg(row_to_json(t)) from (
      select tt.typname, e.enumlabel
      from pg_type tt
      join pg_enum e on tt.oid = e.enumtypid
      order by tt.typname, e.enumsortorder
    ) t
  ),
  'policies', (
    select json_agg(row_to_json(t)) from (
      select tablename, policyname, cmd, qual, with_check
      from pg_policies
      where schemaname = 'public'
      order by tablename
    ) t
  ),
  'rls_enabled', (
    select json_agg(row_to_json(t)) from (
      select relname, relrowsecurity
      from pg_class
      where relname in ('companies','profiles','jobs','candidates')
    ) t
  )
) as result;
