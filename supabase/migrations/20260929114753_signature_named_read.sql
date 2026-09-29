-- Signature reports use the same name-entry flow as the existing student library.
-- A per-request name header limits anonymous reads to one named student's rows.
-- This does not grant anonymous grade/comment writes.
begin;

create policy mock_signature_named_select on public.mock_results
  for select to anon
  using (
    round ~ '^original[12](@[23])?$'
    and encode(convert_to(student, 'UTF8'), 'base64') =
      coalesce(nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-gfield-student', '')
  );

grant select (student, round, comment, updated_at)
  on public.hs_final_report_comments to anon;

create policy signature_named_comment_select on public.hs_final_report_comments
  for select to anon
  using (
    round ~ '^original[12]$'
    and encode(convert_to(student, 'UTF8'), 'base64') =
      coalesce(nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-gfield-student', '')
  );

commit;
