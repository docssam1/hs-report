begin;

create table if not exists public.hs_accounts (
  user_id uuid primary key references auth.users(id) on delete restrict,
  student text not null check (btrim(student) <> ''),
  login_email text not null unique,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  can_self_enter boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists hs_accounts_student_ci_uq
  on public.hs_accounts (lower(btrim(student)));

alter table public.hs_accounts enable row level security;
revoke all on public.hs_accounts from public, anon, authenticated;
grant select, insert, update, delete on public.hs_accounts to service_role;

alter table public.mock_results
  add column if not exists owner_id uuid references auth.users(id) on delete restrict;

alter table public.weak_types
  add column if not exists owner_id uuid references auth.users(id) on delete restrict;

create unique index if not exists mock_results_owner_round_uq
  on public.mock_results (owner_id, round);

create unique index if not exists weak_types_owner_type_uq
  on public.weak_types (owner_id, type);

grant select, insert, update, delete on public.mock_results to service_role;
grant select, insert, update, delete on public.weak_types to service_role;

grant select, insert, update on public.mock_results to authenticated;
grant select, insert, update, delete on public.weak_types to authenticated;

drop policy if exists mock_auth_select on public.mock_results;
create policy mock_auth_select on public.mock_results
for select to authenticated
using (
  owner_id = (select auth.uid())
  or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
);

drop policy if exists mock_auth_insert on public.mock_results;
create policy mock_auth_insert on public.mock_results
for insert to authenticated
with check (
  owner_id is not null
  and (
    owner_id = (select auth.uid())
    or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
  )
);

drop policy if exists mock_auth_update on public.mock_results;
create policy mock_auth_update on public.mock_results
for update to authenticated
using (
  owner_id = (select auth.uid())
  or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
)
with check (
  owner_id is not null
  and (
    owner_id = (select auth.uid())
    or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
  )
);

drop policy if exists weak_auth_select on public.weak_types;
create policy weak_auth_select on public.weak_types
for select to authenticated
using (
  owner_id = (select auth.uid())
  or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
);

drop policy if exists weak_auth_insert on public.weak_types;
create policy weak_auth_insert on public.weak_types
for insert to authenticated
with check (
  owner_id is not null
  and (
    owner_id = (select auth.uid())
    or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
  )
);

drop policy if exists weak_auth_update on public.weak_types;
create policy weak_auth_update on public.weak_types
for update to authenticated
using (
  owner_id = (select auth.uid())
  or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
)
with check (
  owner_id is not null
  and (
    owner_id = (select auth.uid())
    or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
  )
);

drop policy if exists weak_auth_delete on public.weak_types;
create policy weak_auth_delete on public.weak_types
for delete to authenticated
using (
  owner_id = (select auth.uid())
  or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
);

create table if not exists public.hs_admin_devices (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  label text not null default '관리자 기기',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table public.hs_admin_devices enable row level security;
revoke all on public.hs_admin_devices from public, anon, authenticated;
grant select, insert, update, delete on public.hs_admin_devices to service_role;

create table if not exists public.hs_admin_enrollments (
  token_hash text primary key,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.hs_admin_enrollments enable row level security;
revoke all on public.hs_admin_enrollments from public, anon, authenticated;
grant select, insert, update, delete on public.hs_admin_enrollments to service_role;

create table if not exists public.hs_auth_rate_limits (
  key_hash text not null,
  window_start timestamptz not null,
  hits integer not null check (hits > 0),
  primary key (key_hash, window_start)
);

alter table public.hs_auth_rate_limits enable row level security;
revoke all on public.hs_auth_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.hs_auth_rate_limits to service_role;

create or replace function public.consume_hs_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table(allowed boolean, remaining integer, retry_after integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_start timestamptz;
  v_hits integer;
begin
  if p_key_hash is null or p_key_hash = '' or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit arguments';
  end if;

  v_start := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds)
    * p_window_seconds
  );

  insert into public.hs_auth_rate_limits(key_hash, window_start, hits)
  values (p_key_hash, v_start, 1)
  on conflict (key_hash, window_start)
  do update set hits = public.hs_auth_rate_limits.hits + 1
  returning hits into v_hits;

  allowed := v_hits <= p_limit;
  remaining := greatest(p_limit - v_hits, 0);
  retry_after := greatest(
    1,
    ceil(extract(epoch from (
      v_start + make_interval(secs => p_window_seconds) - clock_timestamp()
    )))::integer
  );
  return next;
end;
$$;

revoke all on function public.consume_hs_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_hs_rate_limit(text, integer, integer)
  to service_role;

commit;
