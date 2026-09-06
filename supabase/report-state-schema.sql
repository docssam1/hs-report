-- Server-only report snapshots. No changes to original results or accounts.
create table public.hs_final_report_snapshots (
  student text not null,
  round text not null check (round = 'final1'),
  result_ox text not null check (result_ox ~ '^[OX]{30}$'),
  result_score numeric not null check (result_score between 0 and 100),
  snapshot jsonb not null,
  applied_at timestamptz not null default now(),
  primary key (student, round)
);
create table public.hs_final_report_comments (
  student text not null,
  round text not null check (round ~ '^final[1-5]$'),
  comment text not null check (char_length(comment) <= 3000),
  updated_at timestamptz not null default now(),
  updated_by uuid not null,
  primary key (student, round)
);
create table public.hs_final_report_references (
  exam text primary key check (exam = 'final1'),
  version text not null,
  reference jsonb not null,
  applied_at timestamptz not null default now()
);
alter table public.hs_final_report_snapshots enable row level security;
alter table public.hs_final_report_comments enable row level security;
alter table public.hs_final_report_references enable row level security;
revoke all on public.hs_final_report_snapshots, public.hs_final_report_comments, public.hs_final_report_references from public, anon, authenticated;
grant select, insert, update on public.hs_final_report_snapshots, public.hs_final_report_comments, public.hs_final_report_references to service_role;
