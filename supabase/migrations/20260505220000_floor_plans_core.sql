-- Floor plans (multi-plans): indoor / terrace / custom
-- Source de vérité pour l'éditeur 2D et la séparation intérieur/terrasse.

create table if not exists public.floor_plans (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  type text not null default 'custom',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint floor_plans_type_check check (type in ('indoor', 'terrace', 'custom'))
);

create index if not exists floor_plans_restaurant_id_idx
  on public.floor_plans (restaurant_id);

create index if not exists floor_plans_restaurant_active_idx
  on public.floor_plans (restaurant_id, is_active, sort_order);

-- updated_at trigger (utilise la fonction déjà créée si elle existe)
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

drop trigger if exists set_floor_plans_updated_at on public.floor_plans;
create trigger set_floor_plans_updated_at
before update on public.floor_plans
for each row execute function public.zengrow_set_updated_at();

-- RLS
alter table public.floor_plans enable row level security;

drop policy if exists "floor_plans_owner_select" on public.floor_plans;
create policy "floor_plans_owner_select"
on public.floor_plans for select
using (
  exists (
    select 1 from public.restaurants r
    where r.id = floor_plans.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "floor_plans_owner_insert" on public.floor_plans;
create policy "floor_plans_owner_insert"
on public.floor_plans for insert
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = floor_plans.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "floor_plans_owner_update" on public.floor_plans;
create policy "floor_plans_owner_update"
on public.floor_plans for update
using (
  exists (
    select 1 from public.restaurants r
    where r.id = floor_plans.restaurant_id and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = floor_plans.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "floor_plans_owner_delete" on public.floor_plans;
create policy "floor_plans_owner_delete"
on public.floor_plans for delete
using (
  exists (
    select 1 from public.restaurants r
    where r.id = floor_plans.restaurant_id and r.owner_id = auth.uid()
  )
);

-- Ajouter floor_plan_id aux tables et éléments
alter table public.restaurant_tables
  add column if not exists floor_plan_id uuid references public.floor_plans(id) on delete set null;

create index if not exists restaurant_tables_floor_plan_id_idx
  on public.restaurant_tables (floor_plan_id);

alter table public.floor_plan_elements
  add column if not exists floor_plan_id uuid references public.floor_plans(id) on delete cascade;

create index if not exists floor_plan_elements_floor_plan_id_idx
  on public.floor_plan_elements (floor_plan_id);

-- Réservations : mémoriser le plan (dérivé de la table)
alter table public.reservations
  add column if not exists floor_plan_id uuid references public.floor_plans(id) on delete set null;

create index if not exists reservations_floor_plan_id_idx
  on public.reservations (floor_plan_id);

-- Backfill: créer un plan indoor par défaut par restaurant ayant des tables, puis assigner
do $$
declare
  r record;
  indoor_id uuid;
  terrace_id uuid;
  has_terrace_zone boolean;
begin
  for r in
    select distinct rt.restaurant_id
    from public.restaurant_tables rt
  loop
    -- indoor
    select fp.id into indoor_id
    from public.floor_plans fp
    where fp.restaurant_id = r.restaurant_id and fp.type = 'indoor'
    order by fp.sort_order asc, fp.created_at asc
    limit 1;

    if indoor_id is null then
      insert into public.floor_plans (restaurant_id, name, type, is_active, sort_order)
      values (r.restaurant_id, 'Salle intérieure', 'indoor', true, 0)
      returning id into indoor_id;
    end if;

    -- terrace plan si une zone "terrasse" existe (optionnel) ou si terrasse_enabled est vrai
    select exists(
      select 1 from public.restaurant_zones z
      where z.restaurant_id = r.restaurant_id and lower(z.name) like '%terrasse%'
    ) into has_terrace_zone;

    if has_terrace_zone then
      select fp.id into terrace_id
      from public.floor_plans fp
      where fp.restaurant_id = r.restaurant_id and fp.type = 'terrace'
      order by fp.sort_order asc, fp.created_at asc
      limit 1;

      if terrace_id is null then
        insert into public.floor_plans (restaurant_id, name, type, is_active, sort_order)
        values (r.restaurant_id, 'Terrasse', 'terrace', true, 10)
        returning id into terrace_id;
      end if;

      -- Tables en zone "terrasse" -> plan terrasse
      update public.restaurant_tables t
      set floor_plan_id = terrace_id
      where t.restaurant_id = r.restaurant_id
        and t.floor_plan_id is null
        and t.zone_id in (
          select z.id from public.restaurant_zones z
          where z.restaurant_id = r.restaurant_id and lower(z.name) like '%terrasse%'
        );
    end if;

    -- Le reste -> indoor
    update public.restaurant_tables t
    set floor_plan_id = indoor_id
    where t.restaurant_id = r.restaurant_id
      and t.floor_plan_id is null;

    -- Éléments (si déjà existants) -> indoor
    update public.floor_plan_elements e
    set floor_plan_id = indoor_id
    where e.restaurant_id = r.restaurant_id
      and e.floor_plan_id is null;
  end loop;
end $$;

-- Backfill reservations.floor_plan_id depuis la table
update public.reservations r
set floor_plan_id = t.floor_plan_id
from public.restaurant_tables t
where r.table_id = t.id
  and r.floor_plan_id is null;

