-- Étape 1 — Suppression plan de salle : backup + migration vers mode simple
-- - Backup des 4 tables floor plan dans *_backup (idempotent : ne réécrit pas un backup existant)
-- - Restos en floor_plan : capacité = somme max_covers des tables actives → service_*_max_covers si null/0
-- - Tous les restos : reservation_mode = 'simple'
--
-- Réversibilité 30j : restaurer depuis *_backup (voir supabase/scripts/floor_plan_restore_from_backup.sql)
-- Étape 6 (futur) : DROP tables/colonnes — ne pas inclure ici.

-- ---------------------------------------------------------------------------
-- 0) Journal d'audit (traçabilité)
-- ---------------------------------------------------------------------------
create table if not exists public.schema_migration_audit (
  id uuid primary key default gen_random_uuid(),
  migration_name text not null,
  batch_id uuid not null,
  executed_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);

-- ---------------------------------------------------------------------------
-- 1) Backup (idempotent)
-- ---------------------------------------------------------------------------
do $$
declare
  v_batch uuid := gen_random_uuid();
  v_tables_backed_up integer := 0;
begin
  if to_regclass('public.restaurant_tables_backup') is null then
    execute format(
      'create table public.restaurant_tables_backup as
       select t.*, now() as backed_up_at, %L::uuid as backup_batch_id
       from public.restaurant_tables t',
      v_batch
    );
    v_tables_backed_up := v_tables_backed_up + 1;
  end if;

  if to_regclass('public.floor_plans_backup') is null then
    execute format(
      'create table public.floor_plans_backup as
       select fp.*, now() as backed_up_at, %L::uuid as backup_batch_id
       from public.floor_plans fp',
      v_batch
    );
    v_tables_backed_up := v_tables_backed_up + 1;
  end if;

  if to_regclass('public.floor_plan_elements_backup') is null then
    execute format(
      'create table public.floor_plan_elements_backup as
       select e.*, now() as backed_up_at, %L::uuid as backup_batch_id
       from public.floor_plan_elements e',
      v_batch
    );
    v_tables_backed_up := v_tables_backed_up + 1;
  end if;

  if to_regclass('public.restaurant_zones_backup') is null then
    execute format(
      'create table public.restaurant_zones_backup as
       select z.*, now() as backed_up_at, %L::uuid as backup_batch_id
       from public.restaurant_zones z',
      v_batch
    );
    v_tables_backed_up := v_tables_backed_up + 1;
  end if;

  insert into public.schema_migration_audit (migration_name, batch_id, details)
  values (
    '20260522120000_floor_plan_backup_and_migrate_to_simple',
    v_batch,
    jsonb_build_object(
      'phase', 'backup',
      'new_backup_tables_created', v_tables_backed_up,
      'skipped_existing_backups', 4 - v_tables_backed_up
    )
  );
end $$;

comment on table public.restaurant_tables_backup is
  'Backup plan de salle (étape 1). Conserver 30j avant DROP. Restauration : floor_plan_restore_from_backup.sql';

comment on table public.floor_plans_backup is
  'Backup plan de salle (étape 1). Conserver 30j avant DROP.';

comment on table public.floor_plan_elements_backup is
  'Backup plan de salle (étape 1). Conserver 30j avant DROP.';

comment on table public.restaurant_zones_backup is
  'Backup plan de salle (étape 1). Conserver 30j avant DROP.';

-- ---------------------------------------------------------------------------
-- 2) Capacité : floor_plan → service_*_max_covers (si null ou 0)
-- ---------------------------------------------------------------------------
with active_table_capacity as (
  select
    rt.restaurant_id,
    coalesce(sum(rt.max_covers), 0)::integer as total_active_covers
  from public.restaurant_tables rt
  where rt.status = 'active'
  group by rt.restaurant_id
),
floor_plan_targets as (
  select
    rs.restaurant_id,
    coalesce(atc.total_active_covers, 0) as computed_capacity
  from public.restaurant_settings rs
  left join active_table_capacity atc on atc.restaurant_id = rs.restaurant_id
  where rs.reservation_mode = 'floor_plan'
),
lunch_updates as (
  update public.restaurant_settings rs
  set service_lunch_max_covers = ft.computed_capacity
  from floor_plan_targets ft
  where rs.restaurant_id = ft.restaurant_id
    and ft.computed_capacity > 0
    and (rs.service_lunch_max_covers is null or rs.service_lunch_max_covers = 0)
  returning rs.restaurant_id
),
dinner_updates as (
  update public.restaurant_settings rs
  set service_dinner_max_covers = ft.computed_capacity
  from floor_plan_targets ft
  where rs.restaurant_id = ft.restaurant_id
    and ft.computed_capacity > 0
    and (rs.service_dinner_max_covers is null or rs.service_dinner_max_covers = 0)
  returning rs.restaurant_id
)
insert into public.schema_migration_audit (migration_name, batch_id, details)
select
  '20260522120000_floor_plan_backup_and_migrate_to_simple',
  gen_random_uuid(),
  jsonb_build_object(
    'phase', 'capacity_migration',
    'lunch_max_covers_updated', (select count(*)::integer from lunch_updates),
    'dinner_max_covers_updated', (select count(*)::integer from dinner_updates)
  );

-- ---------------------------------------------------------------------------
-- 3) Forcer mode simple pour tous les restaurants
-- ---------------------------------------------------------------------------
with mode_updates as (
  update public.restaurant_settings
  set reservation_mode = 'simple'
  where reservation_mode is distinct from 'simple'
  returning restaurant_id
)
insert into public.schema_migration_audit (migration_name, batch_id, details)
select
  '20260522120000_floor_plan_backup_and_migrate_to_simple',
  gen_random_uuid(),
  jsonb_build_object(
    'phase', 'force_simple_mode',
    'restaurants_updated', (select count(*)::integer from mode_updates)
  );
