begin;

-- Preserve the legacy anonymous flow for other exams, but never expose
-- Signature first attempts or practice attempts by student name alone.
alter policy mock_select on public.mock_results
  to anon using (round !~ '^original[12](@[23])?$');
alter policy mock_insert on public.mock_results
  to anon with check (round !~ '^original[12](@[23])?$');
alter policy mock_update on public.mock_results
  to anon
  using (round !~ '^original[12](@[23])?$')
  with check (round !~ '^original[12](@[23])?$');

-- An authenticated, active teacher may record a Signature result before
-- the child account is approved. Approval later links owner_id to the child.
alter policy mock_auth_insert on public.mock_results
  to authenticated with check (
    exists (
      select 1 from public.hs_accounts account
      where account.user_id = (select auth.uid()) and account.active
    )
    and (
      (
        owner_id = (select auth.uid())
        and exists (
          select 1 from public.hs_accounts account
          where account.user_id = (select auth.uid())
            and account.active and account.student = mock_results.student
        )
      )
      or (
        round ~ '^original[12](@[23])?$'
        and coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
      )
      or (
        owner_id is not null
        and coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
      )
    )
  );

alter policy mock_auth_update on public.mock_results
  to authenticated
  using (
    exists (
      select 1 from public.hs_accounts account
      where account.user_id = (select auth.uid()) and account.active
    )
    and (
      owner_id = (select auth.uid())
      or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
    )
  )
  with check (
    exists (
      select 1 from public.hs_accounts account
      where account.user_id = (select auth.uid()) and account.active
    )
    and (
      (
        owner_id = (select auth.uid())
        and exists (
          select 1 from public.hs_accounts account
          where account.user_id = (select auth.uid())
            and account.active and account.student = mock_results.student
        )
      )
      or (
        round ~ '^original[12](@[23])?$'
        and coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
      )
      or (
        owner_id is not null
        and coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
      )
    )
  );

commit;
