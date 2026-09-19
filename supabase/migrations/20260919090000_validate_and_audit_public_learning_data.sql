begin;

-- Preserve the current name-based student flow while rejecting malformed
-- records before they can replace a valid score.
alter table public.mock_results
  add constraint mock_results_student_shape_ck
  check (
    length(btrim(student)) between 1 and 80
    and student !~ '[[:cntrl:]]'
  ) not valid,
  add constraint mock_results_round_shape_ck
  check (
    round ~ '^([1-9][0-9]?|(final|last|original|hw|middle)[1-9][0-9]?)(@[23])?$'
  ) not valid,
  add constraint mock_results_source_shape_ck
  check (
    coalesce(source, 'parent') in
      ('parent', 'online', 'practice', 'teacher', 'admin', 'practice-admin', 'reset')
  ) not valid,
  add constraint mock_results_payload_shape_ck
  check (
    (
      source = 'reset'
      and ox = 'RESET'
      and score = 0
      and wrong = 0
    )
    or
    (
      source is distinct from 'reset'
      and ox ~ '^[OX]{30}$'
      and score is not null
      and score between 0 and 100
      and wrong is not null
      and wrong between 0 and 30
      and wrong = length(ox) - length(replace(ox, 'X', ''))
    )
  ) not valid;

alter table public.mock_results validate constraint mock_results_student_shape_ck;
alter table public.mock_results validate constraint mock_results_round_shape_ck;
alter table public.mock_results validate constraint mock_results_source_shape_ck;
alter table public.mock_results validate constraint mock_results_payload_shape_ck;

alter table public.weak_types
  add constraint weak_types_student_shape_ck
  check (
    length(btrim(student)) between 1 and 80
    and student !~ '[[:cntrl:]]'
  ) not valid,
  add constraint weak_types_type_shape_ck
  check (
    length(btrim(type)) between 1 and 160
    and type !~ '[[:cntrl:]]'
  ) not valid,
  add constraint weak_types_metadata_shape_ck
  check (
    (area is null or (length(area) <= 100 and area !~ '[[:cntrl:]]'))
    and length(set_key) between 1 and 24
    and set_key ~ '^[a-zA-Z0-9_-]+$'
    and (round is null or round ~ '^([1-9][0-9]?|(final|last|original|hw|middle)[1-9][0-9]?)(@[23])?$')
    and (qno is null or qno between 1 and 100)
  ) not valid;

alter table public.weak_types validate constraint weak_types_student_shape_ck;
alter table public.weak_types validate constraint weak_types_type_shape_ck;
alter table public.weak_types validate constraint weak_types_metadata_shape_ck;

alter table public.access_log
  add constraint access_log_student_shape_ck
  check (
    length(btrim(student)) between 1 and 80
    and student !~ '[[:cntrl:]]'
  ) not valid,
  add constraint access_log_page_shape_ck
  check (
    page is null
    or (length(page) between 1 and 160 and page !~ '[[:cntrl:]]')
  ) not valid;

alter table public.access_log validate constraint access_log_student_shape_ck;
alter table public.access_log validate constraint access_log_page_shape_ck;

-- Client-supplied timestamps are normalized on the server without changing
-- any existing submission, retry, or reset route.
create or replace function public.set_hs_learning_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

revoke all on function public.set_hs_learning_updated_at()
  from public, anon, authenticated;

drop trigger if exists set_mock_results_updated_at on public.mock_results;
create trigger set_mock_results_updated_at
before insert or update on public.mock_results
for each row execute function public.set_hs_learning_updated_at();

drop trigger if exists set_weak_types_updated_at on public.weak_types;
create trigger set_weak_types_updated_at
before insert or update on public.weak_types
for each row execute function public.set_hs_learning_updated_at();

-- The audit table is private and append-only to public clients. It preserves
-- the before/after state for recovery without changing the current screens.
create table if not exists public.hs_learning_data_audit (
  id bigint generated always as identity primary key,
  table_name text not null check (table_name in ('mock_results', 'weak_types')),
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  row_key jsonb not null,
  old_data jsonb,
  new_data jsonb,
  actor_role text,
  actor_user_id uuid,
  changed_at timestamptz not null default clock_timestamp()
);

create index if not exists hs_learning_data_audit_row_key_idx
  on public.hs_learning_data_audit (table_name, changed_at desc);

alter table public.hs_learning_data_audit enable row level security;
revoke all on public.hs_learning_data_audit from public, anon, authenticated;
grant select, insert, update, delete on public.hs_learning_data_audit to service_role;

drop policy if exists hs_learning_data_audit_service_only on public.hs_learning_data_audit;
create policy hs_learning_data_audit_service_only
on public.hs_learning_data_audit
for all to service_role
using (true)
with check (true);

create or replace function public.audit_hs_learning_data()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  key_data jsonb;
begin
  if tg_table_name = 'mock_results' then
    key_data := jsonb_build_object(
      'student', coalesce(new.student, old.student),
      'round', coalesce(new.round, old.round)
    );
  else
    key_data := jsonb_build_object(
      'student', coalesce(new.student, old.student),
      'type', coalesce(new.type, old.type)
    );
  end if;

  insert into public.hs_learning_data_audit (
    table_name,
    operation,
    row_key,
    old_data,
    new_data,
    actor_role,
    actor_user_id
  ) values (
    tg_table_name,
    tg_op,
    key_data,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
    auth.role(),
    auth.uid()
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.audit_hs_learning_data()
  from public, anon, authenticated;

drop trigger if exists audit_mock_results on public.mock_results;
create trigger audit_mock_results
after insert or update or delete on public.mock_results
for each row execute function public.audit_hs_learning_data();

drop trigger if exists audit_weak_types on public.weak_types;
create trigger audit_weak_types
after insert or update or delete on public.weak_types
for each row execute function public.audit_hs_learning_data();

-- These privileges are never needed by the browser APIs and bypass normal
-- row operations. Removing them does not affect SELECT/INSERT/UPDATE flows.
revoke truncate, references, trigger
  on public.mock_results, public.weak_types, public.access_log
  from anon, authenticated;

commit;
