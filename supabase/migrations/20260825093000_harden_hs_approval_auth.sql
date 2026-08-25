begin;

create index if not exists hs_admin_devices_admin_user_idx
  on public.hs_admin_devices (admin_user_id);

create index if not exists hs_admin_enrollments_created_by_idx
  on public.hs_admin_enrollments (created_by)
  where created_by is not null;

create index if not exists hs_admin_enrollments_expiry_idx
  on public.hs_admin_enrollments (expires_at)
  where used_at is null;

drop policy if exists hs_accounts_service_only on public.hs_accounts;
create policy hs_accounts_service_only on public.hs_accounts
for all to service_role using (true) with check (true);

drop policy if exists hs_admin_devices_service_only on public.hs_admin_devices;
create policy hs_admin_devices_service_only on public.hs_admin_devices
for all to service_role using (true) with check (true);

drop policy if exists hs_admin_enrollments_service_only on public.hs_admin_enrollments;
create policy hs_admin_enrollments_service_only on public.hs_admin_enrollments
for all to service_role using (true) with check (true);

drop policy if exists hs_auth_rate_limits_service_only on public.hs_auth_rate_limits;
create policy hs_auth_rate_limits_service_only on public.hs_auth_rate_limits
for all to service_role using (true) with check (true);

commit;
