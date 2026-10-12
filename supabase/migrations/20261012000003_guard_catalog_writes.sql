-- Only the current panel can change the shared catalog. Older deployed panels
-- lose direct write access instead of replacing newer data with their cache.
drop policy if exists "staff manages content" on public.site_content;

create policy "staff reads drafts"
on public.site_content for select
to authenticated
using ((select private.is_staff()));

create or replace function public.save_site_content(
  p_content jsonb,
  p_expected_updated_at timestamptz,
  p_publish boolean,
  p_author text default null
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated_at timestamptz := clock_timestamp();
  v_current_updated_at timestamptz;
begin
  if not private.is_staff() then
    raise exception 'Acesso administrativo necessário' using errcode = '42501';
  end if;

  select updated_at into v_current_updated_at
  from public.site_content
  where id = 'draft_main'
  for update;

  if v_current_updated_at is distinct from p_expected_updated_at then
    raise exception 'O catálogo foi alterado em outro dispositivo. Recarregue o painel antes de salvar.'
      using errcode = '40001';
  end if;

  update public.site_content
  set content = p_content,
      updated_at = v_updated_at
  where id = 'draft_main';

  if p_publish then
    update public.site_content
    set content = p_content,
        published_at = v_updated_at,
        published_by = coalesce(nullif(p_author, ''), 'Administrador'),
        updated_at = v_updated_at
    where id = 'published_main';
  end if;

  return v_updated_at;
end;
$$;

revoke all on function public.save_site_content(jsonb, timestamptz, boolean, text) from public, anon;
grant execute on function public.save_site_content(jsonb, timestamptz, boolean, text) to authenticated;
