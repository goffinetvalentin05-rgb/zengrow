-- Éditeur 2D : éléments de plan (murs, portes, fenêtres, zones visuelles, bar, texte...)
-- Les tables restent dans public.restaurant_tables (déjà existant), avec colonnes de layout.

create table if not exists public.floor_plan_elements (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  type text not null,
  label text,
  x_position integer not null default 100,
  y_position integer not null default 100,
  width integer not null default 120,
  height integer not null default 40,
  rotation integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint floor_plan_elements_type_check
    check (type in ('wall', 'door', 'window', 'zone', 'bar', 'label', 'other'))
);

create index if not exists floor_plan_elements_restaurant_id_idx
  on public.floor_plan_elements (restaurant_id);

create index if not exists floor_plan_elements_restaurant_type_idx
  on public.floor_plan_elements (restaurant_id, type);

-- Updated_at
create or replace function public.zengrow_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_floor_plan_elements_updated_at on public.floor_plan_elements;
create trigger set_floor_plan_elements_updated_at
before update on public.floor_plan_elements
for each row execute function public.zengrow_set_updated_at();

-- RLS
alter table public.floor_plan_elements enable row level security;

drop policy if exists "floor_plan_elements_owner_select" on public.floor_plan_elements;
create policy "floor_plan_elements_owner_select"
on public.floor_plan_elements for select
using (
  exists (
    select 1 from public.restaurants r
    where r.id = floor_plan_elements.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "floor_plan_elements_owner_insert" on public.floor_plan_elements;
create policy "floor_plan_elements_owner_insert"
on public.floor_plan_elements for insert
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = floor_plan_elements.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "floor_plan_elements_owner_update" on public.floor_plan_elements;
create policy "floor_plan_elements_owner_update"
on public.floor_plan_elements for update
using (
  exists (
    select 1 from public.restaurants r
    where r.id = floor_plan_elements.restaurant_id and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = floor_plan_elements.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "floor_plan_elements_owner_delete" on public.floor_plan_elements;
create policy "floor_plan_elements_owner_delete"
on public.floor_plan_elements for delete
using (
  exists (
    select 1 from public.restaurants r
    where r.id = floor_plan_elements.restaurant_id and r.owner_id = auth.uid()
  )
);

-- Fond de plan (image de référence) : stocké dans les settings du restaurant.
alter table public.restaurant_settings
  add column if not exists floor_plan_background_url text,
  add column if not exists floor_plan_background_opacity integer not null default 30;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_floor_plan_background_opacity_check;
alter table public.restaurant_settings
  add constraint restaurant_settings_floor_plan_background_opacity_check
  check (floor_plan_background_opacity >= 0 and floor_plan_background_opacity <= 100);

