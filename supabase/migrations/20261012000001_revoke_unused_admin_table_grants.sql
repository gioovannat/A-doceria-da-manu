-- Legacy table is not used by the application. Keep RLS deny-by-default and
-- remove API grants as a second layer of protection.
revoke all on table public.admin_users from anon, authenticated;
