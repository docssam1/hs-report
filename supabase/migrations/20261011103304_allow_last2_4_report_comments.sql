-- Extend isolated teacher comments for Last 2-4 while preserving the live Final 8 allowance.
-- No percentile reference, snapshot, grade, account or comment row is changed here.
begin;

alter table public.hs_final_report_comments
  drop constraint if exists hs_final_report_comments_round_check,
  add constraint hs_final_report_comments_round_check
    check (round ~ '^(final([1-5]|7|8)|last[1-4]|original[12])$');

commit;
