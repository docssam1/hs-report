-- 배포 준비 SQL. 기존 성적/계정/이메일/자료 승인 불변. 서버 전용 PIN 검증 상태만 추가.
begin;
create table if not exists public.hs_student_pins (
  student_user_id uuid primary key references public.hs_parent_links(student_user_id) on delete cascade,
  pin_hash text not null check (pin_hash ~ '^[a-f0-9]{64}$'),
  pin_salt text not null check (pin_salt ~ '^[a-f0-9]{32}$'),
  failed_attempts integer not null default 0 check (failed_attempts between 0 and 5),
  updated_at timestamptz not null default now()
);
alter table public.hs_student_pins enable row level security;
revoke all on public.hs_student_pins from public, anon, authenticated;
grant select, insert, update on public.hs_student_pins to service_role;

-- 동시 요청도 학생 단위 행 잠금으로 누적: 5회 실패 후 이메일 재인증 전까지 풀리지 않는다.
create or replace function public.check_hs_student_pin(p_student uuid, p_digest text, p_salt text)
returns text language plpgsql security invoker set search_path = '' as $$
declare v public.hs_student_pins%rowtype;
begin
  select * into v from public.hs_student_pins where student_user_id=p_student for update;
  if not found then return 'PIN_NOT_READY'; end if;
  if v.failed_attempts >= 5 then return 'PIN_LOCKED'; end if;
  if v.pin_salt <> p_salt then return 'PIN_CHANGED'; end if;
  if v.pin_hash = p_digest then
    update public.hs_student_pins set failed_attempts=0 where student_user_id=p_student;
    return 'OK';
  end if;
  update public.hs_student_pins set failed_attempts=failed_attempts+1 where student_user_id=p_student;
  return case when v.failed_attempts >= 4 then 'PIN_LOCKED' else 'INVALID_PIN' end;
end;
$$;
revoke all on function public.check_hs_student_pin(uuid,text,text) from public, anon, authenticated;
grant execute on function public.check_hs_student_pin(uuid,text,text) to service_role;
commit;
