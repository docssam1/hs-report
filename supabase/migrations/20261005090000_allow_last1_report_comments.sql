-- Last 1 uses an isolated teacher-comment key without creating a percentile snapshot baseline.
begin;

alter table public.hs_final_report_comments
  drop constraint if exists hs_final_report_comments_round_check,
  add constraint hs_final_report_comments_round_check
    check (round ~ '^(final([1-5]|7)|last1|original[12])$');

commit;
