-- Only the report service may issue or consume a handoff. No client grants.
begin;
create table if not exists public.hs_hyperfocus_handoffs (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  device_id uuid not null references public.hs_student_devices(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '60 seconds',
  access_expires_at timestamptz not null,
  consumed_at timestamptz,
  session_token_hash text unique check (session_token_hash ~ '^[a-f0-9]{64}$'),
  check (expires_at <= created_at + interval '60 seconds'),
  check (access_expires_at <= created_at + interval '1 hour')
);
alter table public.hs_hyperfocus_handoffs enable row level security;
revoke all on public.hs_hyperfocus_handoffs from public, anon, authenticated;
grant select,insert,update,delete on public.hs_hyperfocus_handoffs to service_role;

create or replace function public.hs_hyperfocus_context(p_user uuid,p_session uuid,p_device_hash text)
returns table(user_id uuid,student text,device_id uuid,session_expires_at timestamptz)
language sql security definer set search_path = '' as $$
  select a.user_id,a.student,d.id,s.not_after
  from public.hs_accounts a
  join auth.sessions s on s.user_id=a.user_id and s.id=p_session
  join public.hs_parent_links l on l.student_user_id=a.user_id
  join public.hs_student_devices d on d.student_user_id=a.user_id and d.device_hash=p_device_hash
  where a.user_id=p_user and a.role='student' and a.active=true
    and (s.not_after is null or s.not_after>now());
$$;
revoke all on function public.hs_hyperfocus_context(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.hs_hyperfocus_context(uuid,uuid,text) to service_role;

create or replace function public.hs_consume_hyperfocus_handoff(p_token_hash text,p_session_token_hash text)
returns table(user_id uuid,student text,access_expires_at timestamptz)
language sql security definer set search_path = '' as $$
  update public.hs_hyperfocus_handoffs h set consumed_at=now(),session_token_hash=p_session_token_hash
  from public.hs_accounts a, auth.sessions s,public.hs_student_devices d
  where p_session_token_hash ~ '^[a-f0-9]{64}$' and p_session_token_hash<>p_token_hash and h.token_hash=p_token_hash and h.consumed_at is null and h.expires_at>now() and h.access_expires_at>now()
    and a.user_id=h.user_id and a.role='student' and a.active=true
    and s.id=h.session_id and s.user_id=h.user_id and (s.not_after is null or s.not_after>now())
    and d.id=h.device_id and d.student_user_id=h.user_id
    and exists(select 1 from public.hs_parent_links l where l.student_user_id=h.user_id)
  returning h.user_id,a.student,h.access_expires_at;
$$;
revoke all on function public.hs_consume_hyperfocus_handoff(text,text) from public,anon,authenticated;
grant execute on function public.hs_consume_hyperfocus_handoff(text,text) to service_role;

create or replace function public.hs_resume_hyperfocus_session(p_session_token_hash text)
returns table(user_id uuid,student text,access_expires_at timestamptz)
language sql security definer set search_path = '' as $$
  select h.user_id,a.student,h.access_expires_at
  from public.hs_hyperfocus_handoffs h
  join public.hs_accounts a on a.user_id=h.user_id and a.role='student' and a.active=true
  join auth.sessions s on s.id=h.session_id and s.user_id=h.user_id
  join public.hs_student_devices d on d.id=h.device_id and d.student_user_id=h.user_id
  where h.session_token_hash=p_session_token_hash and h.consumed_at is not null
    and h.access_expires_at>now() and (s.not_after is null or s.not_after>now())
    and exists(select 1 from public.hs_parent_links l where l.student_user_id=h.user_id);
$$;
revoke all on function public.hs_resume_hyperfocus_session(text) from public,anon,authenticated;
grant execute on function public.hs_resume_hyperfocus_session(text) to service_role;
commit;
