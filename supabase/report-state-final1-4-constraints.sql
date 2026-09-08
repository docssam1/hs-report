-- Expand only the existing Final report round checks. Data, keys, RLS and grants stay unchanged.
begin;

alter table public.hs_final_report_snapshots
  drop constraint hs_final_report_snapshots_round_check,
  add constraint hs_final_report_snapshots_round_check
    check (round ~ '^final[1-4]$');

alter table public.hs_final_report_references
  drop constraint hs_final_report_references_exam_check,
  add constraint hs_final_report_references_exam_check
    check (exam ~ '^final[1-4]$');

commit;
