-- Signature 1 and 2 keep separate, teacher-authored report comments.
-- This does not create a population baseline or alter first-attempt grades.
begin;

alter table public.hs_final_report_comments
  drop constraint if exists hs_final_report_comments_round_check,
  add constraint hs_final_report_comments_round_check
    check (round ~ '^(final([1-5]|7)|original[12])$');

commit;
