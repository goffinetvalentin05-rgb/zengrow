-- Concepteur visuel : draft_config / published_config (visiteurs = published uniquement).
-- Réutilise restaurant_public_page_config (RLS déjà en place, lecture anon via RPC).

alter table public.restaurant_public_page_config
  add column if not exists draft_config jsonb not null default '{}'::jsonb;

alter table public.restaurant_public_page_config
  add column if not exists published_config jsonb;

comment on column public.restaurant_public_page_config.draft_config is
  'Brouillon du concepteur de page publique. Jamais exposé en anon.';

comment on column public.restaurant_public_page_config.published_config is
  'Dernière version publiée, rendue sur /r/{slug}. NULL si jamais publié.';

-- Recopie uniquement un document déjà au format concepteur (schemaVersion = 1).
update public.restaurant_public_page_config
set draft_config = draft_document
where draft_config = '{}'::jsonb
  and coalesce(draft_document->>'schemaVersion', '') = '1';

update public.restaurant_public_page_config
set published_config = published_document
where published_config is null
  and coalesce(published_document->>'schemaVersion', '') = '1';

create or replace function public.restaurant_public_page_config_touch_draft()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.draft_updated_at := now();
    return new;
  end if;
  if new.draft_config is distinct from old.draft_config
     or new.draft_document is distinct from old.draft_document then
    new.draft_updated_at := now();
  end if;
  return new;
end;
$$;

create or replace function public.get_restaurant_published_page_by_slug(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(c.published_config, c.published_document)
  from public.restaurant_public_page_config c
  inner join public.restaurants r on r.id = c.restaurant_id
  where r.slug = trim(p_slug)
    and coalesce(c.published_config, c.published_document) is not null
  limit 1;
$$;

comment on function public.get_restaurant_published_page_by_slug(text) is
  'Retourne le JSON publié du concepteur pour un slug ; NULL si jamais publié. N’expose pas le brouillon.';

grant execute on function public.get_restaurant_published_page_by_slug(text) to anon, authenticated;
