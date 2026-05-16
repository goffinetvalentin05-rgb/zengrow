-- =============================================================================
-- ÉTAPE 1 — DRY-RUN (lecture seule)
-- Supabase → SQL Editor : coller et exécuter (prod/staging).
-- Chaque bloc renvoie un jeu de résultats. Aucune écriture.
-- =============================================================================

-- [1] VOLUMES À SAUVEGARDER
select 'restaurant_tables' as source_table, count(*)::bigint as row_count
from public.restaurant_tables
union all
select 'floor_plans', count(*)::bigint from public.floor_plans
union all
select 'floor_plan_elements', count(*)::bigint from public.floor_plan_elements
union all
select 'restaurant_zones', count(*)::bigint from public.restaurant_zones
order by source_table;

-- [2] BACKUPS DÉJÀ PRÉSENTS ?
select
  case when to_regclass('public.restaurant_tables_backup') is null then 'absent' else 'existe' end
    as restaurant_tables_backup,
  case when to_regclass('public.floor_plans_backup') is null then 'absent' else 'existe' end
    as floor_plans_backup,
  case when to_regclass('public.floor_plan_elements_backup') is null then 'absent' else 'existe' end
    as floor_plan_elements_backup,
  case when to_regclass('public.restaurant_zones_backup') is null then 'absent' else 'existe' end
    as restaurant_zones_backup;

-- [3] RÉPARTITION reservation_mode
select
  coalesce(rs.reservation_mode, '(null)') as reservation_mode,
  count(*)::bigint as restaurant_count
from public.restaurant_settings rs
group by 1
order by 2 desc;

-- [4] RESTAURANTS floor_plan — DÉTAIL CAPACITÉ
with active_table_capacity as (
  select
    rt.restaurant_id,
    count(*) filter (where rt.status = 'active')::integer as active_table_count,
    coalesce(sum(rt.max_covers) filter (where rt.status = 'active'), 0)::integer as total_active_covers
  from public.restaurant_tables rt
  group by rt.restaurant_id
),
floor_plan_restaurants as (
  select
    r.id as restaurant_id,
    r.name as restaurant_name,
    r.slug,
    rs.reservation_mode,
    rs.service_lunch_max_covers,
    rs.service_dinner_max_covers,
    coalesce(atc.active_table_count, 0) as active_table_count,
    coalesce(atc.total_active_covers, 0) as computed_capacity_from_tables
  from public.restaurant_settings rs
  join public.restaurants r on r.id = rs.restaurant_id
  left join active_table_capacity atc on atc.restaurant_id = rs.restaurant_id
  where rs.reservation_mode = 'floor_plan'
)
select
  restaurant_name,
  slug,
  active_table_count,
  computed_capacity_from_tables,
  service_lunch_max_covers as lunch_max_before,
  service_dinner_max_covers as dinner_max_before,
  case
    when computed_capacity_from_tables > 0
      and (service_lunch_max_covers is null or service_lunch_max_covers = 0)
    then computed_capacity_from_tables
    else null
  end as lunch_max_after_if_migrated,
  case
    when computed_capacity_from_tables > 0
      and (service_dinner_max_covers is null or service_dinner_max_covers = 0)
    then computed_capacity_from_tables
    else null
  end as dinner_max_after_if_migrated,
  case
    when computed_capacity_from_tables = 0 then 'WARN: floor_plan sans tables actives'
    when computed_capacity_from_tables > 0
      and (service_lunch_max_covers is null or service_lunch_max_covers = 0)
      and (service_dinner_max_covers is null or service_dinner_max_covers = 0)
    then 'OK: les deux capacités seront renseignées'
    when computed_capacity_from_tables > 0
      and (
        (service_lunch_max_covers is null or service_lunch_max_covers = 0)
        or (service_dinner_max_covers is null or service_dinner_max_covers = 0)
      )
    then 'PARTIAL: une seule capacité sera mise à jour'
    else 'SKIP capacité: déjà renseignée'
  end as migration_note
from floor_plan_restaurants
order by restaurant_name;

-- [5] SYNTHÈSE MIGRATION CAPACITÉ
with active_table_capacity as (
  select
    rt.restaurant_id,
    coalesce(sum(rt.max_covers) filter (where rt.status = 'active'), 0)::integer as total_active_covers
  from public.restaurant_tables rt
  group by rt.restaurant_id
),
floor_plan_targets as (
  select
    rs.restaurant_id,
    coalesce(atc.total_active_covers, 0) as computed_capacity,
    rs.service_lunch_max_covers,
    rs.service_dinner_max_covers
  from public.restaurant_settings rs
  left join active_table_capacity atc on atc.restaurant_id = rs.restaurant_id
  where rs.reservation_mode = 'floor_plan'
)
select
  count(*)::bigint as floor_plan_restaurants,
  count(*) filter (
    where computed_capacity > 0
      and (service_lunch_max_covers is null or service_lunch_max_covers = 0)
  )::bigint as lunch_max_would_update,
  count(*) filter (
    where computed_capacity > 0
      and (service_dinner_max_covers is null or service_dinner_max_covers = 0)
  )::bigint as dinner_max_would_update,
  count(*) filter (where computed_capacity = 0)::bigint as warn_zero_table_capacity,
  count(*) filter (
    where computed_capacity = 0
      and (
        service_lunch_max_covers is null
        or service_lunch_max_covers = 0
        or service_dinner_max_covers is null
        or service_dinner_max_covers = 0
      )
  )::bigint as warn_zero_capacity_and_empty_settings
from floor_plan_targets;

-- [6] PASSAGE EN MODE simple
select
  count(*) filter (where reservation_mode is distinct from 'simple')::bigint
    as restaurants_would_switch_to_simple,
  count(*) filter (where reservation_mode = 'floor_plan')::bigint
    as of_which_currently_floor_plan,
  count(*)::bigint as total_restaurants
from public.restaurant_settings;

-- [7] RÉSERVATIONS HISTORIQUES AVEC table_id (inchangées à cette étape)
select
  count(*)::bigint as reservations_with_table_id,
  count(distinct restaurant_id)::bigint as restaurants_affected
from public.reservations
where table_id is not null;
