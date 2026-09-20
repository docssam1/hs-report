-- Final 7 is a standalone exam. It has no cumulative percentile baseline,
-- but teachers still need the same per-student report comment workflow.
begin;

alter table public.hs_final_report_comments
  drop constraint if exists hs_final_report_comments_round_check,
  add constraint hs_final_report_comments_round_check
    check (round ~ '^final([1-5]|7)$');

commit;
