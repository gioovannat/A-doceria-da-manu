-- Move RLS authorization helpers to an internal schema and remove public RPC access.
create schema if not exists private;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor')) $$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;
revoke all on function private.is_staff() from public, anon;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_staff(), private.is_admin() to authenticated, service_role;

drop policy if exists "profile self or staff read" on public.profiles;
create policy "profile self or staff read" on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select private.is_staff()));
drop policy if exists "admin manages profiles" on public.profiles;
create policy "admin manages profiles" on public.profiles for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "staff reads publication history" on public.publish_history;
create policy "staff reads publication history" on public.publish_history for select to authenticated
using ((select private.is_staff()));
drop policy if exists "staff creates publication history" on public.publish_history;
create policy "staff creates publication history" on public.publish_history for insert to authenticated
with check ((select private.is_staff()));

drop policy if exists "staff reads orders" on public.order_events;
create policy "staff reads orders" on public.order_events for select to authenticated
using ((select private.is_staff()));

drop policy if exists "public reads published content" on public.site_content;
create policy "public reads published content" on public.site_content for select to anon
using (id = 'published_main');
create policy "authenticated reads published content" on public.site_content for select to authenticated
using (id = 'published_main' or (select private.is_staff()));
drop policy if exists "staff manages content" on public.site_content;
create policy "staff manages content" on public.site_content for all to authenticated
using ((select private.is_staff())) with check ((select private.is_staff()));

revoke all on function public.is_staff() from public, anon, authenticated, service_role;
revoke all on function public.is_admin() from public, anon, authenticated, service_role;
revoke all on function public.take_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.take_rate_limit(text, integer, integer) to service_role;
revoke all on function public.rls_auto_enable() from public, anon, authenticated, service_role;
