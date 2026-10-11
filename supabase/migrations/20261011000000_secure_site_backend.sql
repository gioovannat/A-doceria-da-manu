-- A Doceria da Manu: content, access control, media and audited quote backend.
-- Run with `supabase db push`, or paste in the Supabase SQL editor once.

create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('admin', 'editor')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id text primary key check (id in ('draft_main', 'published_main')),
  content jsonb not null,
  published_at timestamptz,
  published_by text,
  updated_at timestamptz not null default now()
);

create table if not exists public.publish_history (
  id uuid primary key default gen_random_uuid(),
  published_by text not null,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_events (
  id text primary key,
  customer_name text,
  product_name text not null,
  batter text,
  quantity text,
  flavors text[] not null default '{}',
  packaging text,
  addons text[] not null default '{}',
  date text,
  delivery_type text,
  location text,
  notes text,
  inspiration_photo text,
  estimated_total numeric(10,2) not null default 0,
  formatted_message text,
  created_at timestamptz not null default now()
);

-- Persistent, atomic rate-limit counters used by the Vercel endpoint. Keys are
-- SHA-256 hashes of IP addresses, not the IP addresses themselves.
create table if not exists private.request_rate_limits (
  bucket_key text primary key,
  requests integer not null default 0 check (requests >= 0),
  expires_at timestamptz not null
);

alter table public.profiles enable row level security;
alter table public.site_content enable row level security;
alter table public.publish_history enable row level security;
alter table public.order_events enable row level security;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor')) $$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

revoke all on function public.is_staff() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_staff(), public.is_admin() to authenticated;

drop policy if exists "profile self or staff read" on public.profiles;
create policy "profile self or staff read" on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select public.is_staff()));
drop policy if exists "admin manages profiles" on public.profiles;
create policy "admin manages profiles" on public.profiles for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "public reads published content" on public.site_content;
create policy "public reads published content" on public.site_content for select to anon, authenticated
using (id = 'published_main' or (select public.is_staff()));
drop policy if exists "staff manages content" on public.site_content;
create policy "staff manages content" on public.site_content for all to authenticated
using ((select public.is_staff())) with check ((select public.is_staff()));

drop policy if exists "staff reads publication history" on public.publish_history;
create policy "staff reads publication history" on public.publish_history for select to authenticated using ((select public.is_staff()));
drop policy if exists "staff creates publication history" on public.publish_history;
create policy "staff creates publication history" on public.publish_history for insert to authenticated with check ((select public.is_staff()));

drop policy if exists "staff reads orders" on public.order_events;
create policy "staff reads orders" on public.order_events for select to authenticated using ((select public.is_staff()));

revoke all on public.profiles, public.site_content, public.publish_history, public.order_events from anon, authenticated;
grant select on public.site_content to anon;
grant select on public.profiles, public.site_content, public.publish_history, public.order_events to authenticated;
grant insert, update, delete on public.profiles, public.site_content, public.publish_history to authenticated;
grant all on public.profiles, public.site_content, public.publish_history, public.order_events to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads site media" on storage.objects;
create policy "public reads site media" on storage.objects for select to anon, authenticated using (bucket_id = 'site-media');
drop policy if exists "staff uploads site media" on storage.objects;
create policy "staff uploads site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and (select public.is_staff()));
drop policy if exists "staff updates site media" on storage.objects;
create policy "staff updates site media" on storage.objects for update to authenticated using (bucket_id = 'site-media' and (select public.is_staff())) with check (bucket_id = 'site-media' and (select public.is_staff()));
drop policy if exists "staff deletes site media" on storage.objects;
create policy "staff deletes site media" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and (select public.is_staff()));

create or replace function public.take_rate_limit(p_key text, p_window_seconds integer, p_max_requests integer)
returns boolean language plpgsql security definer set search_path = private, public as $$
declare key_for_window text := p_key || ':' || floor(extract(epoch from now()) / p_window_seconds)::text;
declare allowed boolean;
begin
  if p_window_seconds < 1 or p_max_requests < 1 then raise exception 'invalid rate limit'; end if;
  insert into private.request_rate_limits(bucket_key, requests, expires_at)
  values (key_for_window, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (bucket_key) do update set requests = private.request_rate_limits.requests + 1
  returning requests <= p_max_requests into allowed;
  delete from private.request_rate_limits where expires_at < now() - interval '1 day';
  return allowed;
end; $$;
revoke all on function public.take_rate_limit(text, integer, integer) from public;
grant execute on function public.take_rate_limit(text, integer, integer) to service_role;
grant usage on schema private to service_role;
grant select, insert, update, delete on private.request_rate_limits to service_role;

-- Postgres Changes respects RLS: visitors receive only published_main changes.
do $$ begin alter publication supabase_realtime add table public.site_content; exception when duplicate_object then null; end $$;
