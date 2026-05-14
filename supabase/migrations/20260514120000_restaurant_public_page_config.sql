-- Configuration page publique modulaire (brouillon / publié) pour l’éditeur visuel.
-- Le brouillon n’est jamais exposé en anon : lecture publique via RPC SECURITY DEFINER.

create table if not exists public.restaurant_public_page_config (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  schema_version integer not null default 1,
  draft_document jsonb not null default jsonb_build_object(
    'schemaVersion', 1,
    'theme', jsonb_build_object(),
    'blocks', '[]'::jsonb
  ),
  published_document jsonb,
  draft_updated_at timestamptz not null default now(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurant_public_page_config_restaurant_id_unique unique (restaurant_id),
  constraint restaurant_public_page_config_schema_version_check check (schema_version >= 1)
);

create index if not exists restaurant_public_page_config_restaurant_id_idx
  on public.restaurant_public_page_config (restaurant_id);

comment on table public.restaurant_public_page_config is
  'Document JSON page publique (éditeur) : brouillon + version publiée.';

comment on column public.restaurant_public_page_config.draft_document is
  'État courant de l’éditeur (non public).';

comment on column public.restaurant_public_page_config.published_document is
  'Dernière version publiée ; NULL si jamais publié.';

comment on column public.restaurant_public_page_config.published_at is
  'Horodatage du dernier clic « Publier ».';

-- updated_at (réutilise la fonction projet si elle existe)
do $$
begin
  if not exists (
    select 1
    from pg_proc
    where proname = 'zengrow_set_updated_at'
      and pg_function_is_visible(oid)
  ) then
    create or replace function public.zengrow_set_updated_at()
    returns trigger
    language plpgsql
    as $fn$
    begin
      new.updated_at := now();
      return new;
    end;
    $fn$;
  end if;
end $$;

drop trigger if exists set_restaurant_public_page_config_updated_at
  on public.restaurant_public_page_config;
create trigger set_restaurant_public_page_config_updated_at
before update on public.restaurant_public_page_config
for each row execute function public.zengrow_set_updated_at();

-- draft_updated_at quand le brouillon change
create or replace function public.restaurant_public_page_config_touch_draft()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.draft_updated_at := now();
    return new;
  end if;
  if new.draft_document is distinct from old.draft_document then
    new.draft_updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists touch_restaurant_public_page_config_draft
  on public.restaurant_public_page_config;
create trigger touch_restaurant_public_page_config_draft
before insert or update on public.restaurant_public_page_config
for each row execute function public.restaurant_public_page_config_touch_draft();

alter table public.restaurant_public_page_config enable row level security;

drop policy if exists "restaurant_public_page_config_owner_select"
  on public.restaurant_public_page_config;
create policy "restaurant_public_page_config_owner_select"
on public.restaurant_public_page_config for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_public_page_config.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "restaurant_public_page_config_owner_insert"
  on public.restaurant_public_page_config;
create policy "restaurant_public_page_config_owner_insert"
on public.restaurant_public_page_config for insert
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_public_page_config.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "restaurant_public_page_config_owner_update"
  on public.restaurant_public_page_config;
create policy "restaurant_public_page_config_owner_update"
on public.restaurant_public_page_config for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_public_page_config.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_public_page_config.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "restaurant_public_page_config_owner_delete"
  on public.restaurant_public_page_config;
create policy "restaurant_public_page_config_owner_delete"
on public.restaurant_public_page_config for delete
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_public_page_config.restaurant_id
      and r.owner_id = auth.uid()
  )
);

-- Lecture publique : uniquement published_document, sans exposer draft (pas de policy SELECT anon sur la table).
create or replace function public.get_restaurant_published_page_by_slug(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select c.published_document
  from public.restaurant_public_page_config c
  inner join public.restaurants r on r.id = c.restaurant_id
  where r.slug = trim(p_slug)
    and c.published_document is not null
  limit 1;
$$;

comment on function public.get_restaurant_published_page_by_slug(text) is
  'Retourne le JSON publié de la page modulaire pour un slug resto ; NULL si absent ou jamais publié.';

grant execute on function public.get_restaurant_published_page_by_slug(text) to anon, authenticated;
