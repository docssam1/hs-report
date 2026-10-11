-- 학부모 이메일 인증 ↔ 기존 학생 계정 연결 (서버 전용).
-- 학생 계정 식별자(hs_accounts.user_id)와 성적 owner_id는 바꾸지 않는다.
-- 인증번호·비밀번호·접속 토큰은 저장하지 않는다.

create table if not exists public.hs_parent_links (
  student_user_id uuid primary key references public.hs_accounts(user_id) on delete cascade,
  parent_email text not null check (parent_email = lower(parent_email) and position('@' in parent_email) > 1),
  parent_user_id uuid references auth.users(id) on delete set null,
  first_verified_at timestamptz not null default now(),
  last_verified_at timestamptz not null default now(),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.hs_parent_links is
  'Server-only link between a verified parent email and an existing student account. One email per student (no silent overwrite); one email may link several siblings. Never store OTPs or tokens.';

create index if not exists hs_parent_links_parent_email_idx on public.hs_parent_links (parent_email);

alter table public.hs_parent_links enable row level security;
revoke all on public.hs_parent_links from public, anon, authenticated;
grant select, insert, update, delete on public.hs_parent_links to service_role;
