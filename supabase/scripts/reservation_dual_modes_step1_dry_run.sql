-- =============================================================================
-- ÉTAPE 1 (dual modes) — DRY-RUN (lecture seule)
-- Supabase → SQL Editor : coller et exécuter avant / après migration.
-- Aucune écriture.
-- =============================================================================

-- [1] Colonne reservation_mode présente ?
select
  case
    when exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'restaurant_settings'
        and column_name = 'reservation_mode'
    ) then 'existe'
    else 'absente (migration non appliquée)'
  end as reservation_mode_column,
  case
    when exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'restaurant_settings'
        and column_name = 'time_slots_lunch_max_groups'
    ) then 'existe'
    else 'absente'
  end as time_slots_columns;

-- [2] RÉPARTITION reservation_mode (si colonne présente)
select
  coalesce(rs.reservation_mode, '(null)') as reservation_mode,
  count(*)::bigint as restaurant_count
from public.restaurant_settings rs
group by 1
order by 2 desc;

-- [3] RESTOS SOUS-CONFIGURÉS (couverts midi/soir null ou 0)
select
  count(*) filter (
    where rs.service_lunch_max_covers is null or rs.service_lunch_max_covers <= 0
  )::bigint as lunch_covers_to_backfill,
  count(*) filter (
    where rs.service_dinner_max_covers is null or rs.service_dinner_max_covers <= 0
  )::bigint as dinner_covers_to_backfill,
  count(*)::bigint as total_restaurants
from public.restaurant_settings rs;

-- [4] DURÉES HORS PLAGE 30–240 (seront clampées)
select
  count(*) filter (
    where rs.lunch_duration_minutes is null
       or rs.lunch_duration_minutes < 30
       or rs.lunch_duration_minutes > 240
  )::bigint as lunch_duration_needs_fix,
  count(*) filter (
    where rs.dinner_duration_minutes is null
       or rs.dinner_duration_minutes < 30
       or rs.dinner_duration_minutes > 240
  )::bigint as dinner_duration_needs_fix
from public.restaurant_settings rs;

-- [5] DÉTAIL RESTOS COUVERTS À CORRIGER
select
  r.name,
  r.slug,
  rs.service_lunch_max_covers,
  rs.service_dinner_max_covers,
  case
    when rs.service_lunch_max_covers is null or rs.service_lunch_max_covers <= 0 then 40
    else rs.service_lunch_max_covers
  end as lunch_max_after,
  case
    when rs.service_dinner_max_covers is null or rs.service_dinner_max_covers <= 0 then 50
    else rs.service_dinner_max_covers
  end as dinner_max_after
from public.restaurant_settings rs
join public.restaurants r on r.id = rs.restaurant_id
where rs.service_lunch_max_covers is null
   or rs.service_lunch_max_covers <= 0
   or rs.service_dinner_max_covers is null
   or rs.service_dinner_max_covers <= 0
order by r.name;

-- [6] max_party_size hors 2–30
select
  count(*)::bigint as max_party_size_out_of_range
from public.restaurant_settings rs
where rs.max_party_size is null
   or rs.max_party_size < 2
   or rs.max_party_size > 30;

-- [7] AUDIT MIGRATION (après apply)
select
  executed_at,
  details
from public.schema_migration_audit
where migration_name = '20260523120000_reservation_dual_modes_schema'
order by executed_at desc
limit 5;
