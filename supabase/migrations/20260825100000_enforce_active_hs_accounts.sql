begin;

grant select on public.hs_accounts to authenticated;

drop policy if exists hs_accounts_read_self on public.hs_accounts;
create policy hs_accounts_read_self on public.hs_accounts
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists mock_auth_select on public.mock_results;
create policy mock_auth_select on public.mock_results
for select to authenticated
using (
  exists (
    select 1 from public.hs_accounts account
    where account.user_id = (select auth.uid()) and account.active
  )
  and (
    owner_id = (select auth.uid())
    or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
  )
);

drop policy if exists mock_auth_insert on public.mock_results;
create policy mock_auth_insert on public.mock_results
for insert to authenticated
with check (
  owner_id is not null
  and exists (
    select 1 from public.hs_accounts account
    where account.user_id = (select auth.uid()) and account.active
  )
  and (
    owner_id = (select auth.uid())
    or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
  )
);

drop policy if exists mock_auth_update on public.mock_results;
create policy mock_auth_update on public.mock_results
for update to authenticated
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
  owner_id is not null
  and exists (
    select 1 from public.hs_accounts account
    where account.user_id = (select auth.uid()) and account.active
  )
  and (
    owner_id = (select auth.uid())
    or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
  )
);

drop policy if exists weak_auth_select on public.weak_types;
create policy weak_auth_select on public.weak_types
for select to authenticated
using (
  exists (
    select 1 from public.hs_accounts account
    where account.user_id = (select auth.uid()) and account.active
  )
  and (
    owner_id = (select auth.uid())
    or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
  )
);

drop policy if exists weak_auth_insert on public.weak_types;
create policy weak_auth_insert on public.weak_types
for insert to authenticated
with check (
  owner_id is not null
  and exists (
    select 1 from public.hs_accounts account
    where account.user_id = (select auth.uid()) and account.active
  )
  and (
    owner_id = (select auth.uid())
    or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
  )
);

drop policy if exists weak_auth_update on public.weak_types;
create policy weak_auth_update on public.weak_types
for update to authenticated
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
  owner_id is not null
  and exists (
    select 1 from public.hs_accounts account
    where account.user_id = (select auth.uid()) and account.active
  )
  and (
    owner_id = (select auth.uid())
    or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
  )
);

drop policy if exists weak_auth_delete on public.weak_types;
create policy weak_auth_delete on public.weak_types
for delete to authenticated
using (
  exists (
    select 1 from public.hs_accounts account
    where account.user_id = (select auth.uid()) and account.active
  )
  and (
    owner_id = (select auth.uid())
    or coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') in ('admin', 'teacher')
  )
);

commit;
