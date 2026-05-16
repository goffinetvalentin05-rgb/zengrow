-- =============================================================================
-- ÉTAPE 5 — Vérification croisée (lecture seule + scénarios manuels)
-- Exécuter dans Supabase SQL Editor après migrations 20260523120000 + 20260523140000
-- et déploiement du code étapes 2–4.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- A) SANITÉ SCHÉMA & RPC
-- ---------------------------------------------------------------------------
select
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'restaurant_settings' and column_name = 'reservation_mode'
  ) then 'ok' else 'missing' end as reservation_mode_column,
  case when exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'zengrow_can_book_slot'
  ) then 'ok' else 'missing' end as zengrow_can_book_slot,
  case when exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'zengrow_reservation_intervals_overlap'
  ) then 'ok' else 'missing' end as overlap_helper;

-- Répartition des modes en prod
select
  coalesce(reservation_mode, '(null)') as mode,
  count(*)::bigint as restaurants
from public.restaurant_settings
group by 1
order by 2 desc;

-- ---------------------------------------------------------------------------
-- B) CHECKLIST MANUELLE (à cocher hors SQL)
-- ---------------------------------------------------------------------------
-- [ ] Resto A en global_covers : résa publique 2 pers. → créneau dispo → confirmée
-- [ ] Resto A : 2 résas même créneau dont somme couverts <= capacité → 3e refusée (SLOT_FULL)
-- [ ] Resto B en time_slots : résa publique 4 pers. → OK ; 5e groupe même créneau → créneau complet
-- [ ] Resto B : page publique « Plus de X personnes » → message téléphone, pas de Continuer
-- [ ] Dashboard : résa visible + email confirmation (si mode auto)
-- [ ] Terrasse : couverts (global_covers) vs groupes (time_slots) selon mode
-- [ ] Switch mode dans Paramètres → warning ; anciennes résas inchangées
-- [ ] Capacité midi/soir à 0 → bandeau dashboard + peu/pas de créneaux publics

-- ---------------------------------------------------------------------------
-- C) SIMULATION get_available_slots (remplacer les UUID / dates)
-- ---------------------------------------------------------------------------
-- set local role anon;  -- si test RLS anon
-- select public.get_available_slots(
--   'RESTAURANT_UUID'::uuid,
--   current_date + 1,
--   2,
--   'interior'
-- );

-- ---------------------------------------------------------------------------
-- D) APRÈS RÉSERVATIONS TEST — couverts vs groupes sur un créneau
-- ---------------------------------------------------------------------------
-- Remplacer :restaurant_id, :test_date, :test_time
/*
with params as (
  select
    'RESTAURANT_UUID'::uuid as restaurant_id,
    current_date + 3 as test_date,
    '12:30'::text as test_time
),
settings as (
  select rs.*
  from public.restaurant_settings rs
  cross join params p
  where rs.restaurant_id = p.restaurant_id
)
select
  s.reservation_mode,
  s.service_lunch_max_covers,
  s.time_slots_lunch_max_groups,
  (select count(*) from public.reservations r, params p
   where r.restaurant_id = p.restaurant_id and r.reservation_date = p.test_date
     and r.reservation_time = p.test_time and r.status in ('pending','confirmed')) as groups_at_slot,
  (select coalesce(sum(r.guests),0) from public.reservations r, params p
   where r.restaurant_id = p.restaurant_id and r.reservation_date = p.test_date
     and r.status in ('pending','confirmed')
     and public.zengrow_ss_service_bucket(
       r.reservation_time,
       coalesce(s.service_lunch_enabled,true), s.service_lunch_start, s.service_lunch_end,
       coalesce(s.service_dinner_enabled,true), s.service_dinner_start, s.service_dinner_end
     ) = 'lunch') as lunch_covers_same_service,
  public.zengrow_can_book_slot(
    (select restaurant_id from params),
    (select test_date from params),
    (select test_time from params),
    'interior',
    2,
    s.reservation_mode,
    coalesce(s.terrace_capacity,0),
    coalesce(s.service_lunch_max_covers,40),
    coalesce(s.service_dinner_max_covers,40),
    coalesce(s.time_slots_lunch_max_groups,5),
    coalesce(s.time_slots_dinner_max_groups,8),
    coalesce(s.lunch_duration_minutes,90),
    coalesce(s.dinner_duration_minutes,120),
    coalesce(s.service_lunch_enabled,true), s.service_lunch_start, s.service_lunch_end,
    coalesce(s.service_dinner_enabled,true), s.service_dinner_start, s.service_dinner_end,
    null
  ) as can_book_2_covers
from settings s;
*/

-- ---------------------------------------------------------------------------
-- E) AUDIT MIGRATIONS DUAL MODES
-- ---------------------------------------------------------------------------
select executed_at, details
from public.schema_migration_audit
where migration_name like '202605231%'
order by executed_at desc;
