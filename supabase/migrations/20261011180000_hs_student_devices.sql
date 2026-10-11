-- 학부모 이메일 인증으로 승인된 학생별 기기(브라우저). 학생 1명당 최대 3대(서버 함수에서 강제).
-- 기기 식별값은 브라우저가 만든 임의 값의 해시만 저장한다. 인증번호·접속 토큰은 저장하지 않는다.

create table if not exists public.hs_student_devices (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.hs_accounts(user_id) on delete cascade,
  device_hash text not null check (length(device_hash) = 64),
  label text not null default '',
  session_id uuid,
  first_verified_at timestamptz not null default now(),
  last_verified_at timestamptz not null default now(),
  last_seen_at timestamptz,
  unique (student_user_id, device_hash)
);

comment on table public.hs_student_devices is
  'Server-only list of browsers approved by parent email OTP for a student. Max 3 per student, enforced by hs-parent-auth. Stores only a hash of a random browser id.';

create index if not exists hs_student_devices_student_idx on public.hs_student_devices (student_user_id);

alter table public.hs_student_devices enable row level security;
revoke all on public.hs_student_devices from public, anon, authenticated;
grant select, insert, update, delete on public.hs_student_devices to service_role;

-- 관리자 기기 초기화 때 해당 학생의 로그인 세션을 끝낸다(서비스 역할 전용).
create or replace function public.hs_revoke_student_sessions(p_student_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_student_user_id is null then
    raise exception 'student required';
  end if;
  if not exists (
    select 1 from public.hs_accounts a
    where a.user_id = p_student_user_id and a.role = 'student'
  ) then
    raise exception 'not a student account';
  end if;
  delete from auth.sessions s where s.user_id = p_student_user_id;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.hs_revoke_student_sessions(uuid) from public, anon, authenticated;
grant execute on function public.hs_revoke_student_sessions(uuid) to service_role;
