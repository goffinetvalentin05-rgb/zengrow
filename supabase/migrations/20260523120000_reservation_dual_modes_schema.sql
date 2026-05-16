-- Étape 1 — Modes de réservation : global_covers | time_slots
-- Recrée reservation_mode (supprimé avec le plan de salle) + colonnes time_slots.
-- Aucune modification des RPC (comportement prod inchangé jusqu'à l'étape 3).

-- ---------------------------------------------------------------------------
-- 1) reservation_mode
-- ---------------------------------------------------------------------------
alter table public.restaurant_settings
  add column if not exists reservation_mode text;

update public.restaurant_settings
set reservation_mode = 'global_covers'
where reservation_mode is null;

alter table public.restaurant_settings
  alter column reservation_mode set default 'global_covers';

alter table public.restaurant_settings
  alter column reservation_mode set not null;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_reservation_mode_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_reservation_mode_check
  check (reservation_mode in ('global_covers', 'time_slots'));

comment on column public.restaurant_settings.reservation_mode is
  'global_covers : capacité totale en couverts par service. time_slots : nombre max de groupes par créneau.';

-- ---------------------------------------------------------------------------
-- 2) Colonnes mode time_slots
-- ---------------------------------------------------------------------------
alter table public.restaurant_settings
  add column if not exists time_slots_lunch_max_groups integer,
  add column if not exists time_slots_dinner_max_groups integer,
  add column if not exists time_slots_max_party_size integer;

update public.restaurant_settings
set
  time_slots_lunch_max_groups = coalesce(time_slots_lunch_max_groups, 5),
  time_slots_dinner_max_groups = coalesce(time_slots_dinner_max_groups, 8),
  time_slots_max_party_size = coalesce(
    time_slots_max_party_size,
    least(greatest(coalesce(max_party_size, 8), 2), 30)
  )
where time_slots_lunch_max_groups is null
   or time_slots_dinner_max_groups is null
   or time_slots_max_party_size is null;

alter table public.restaurant_settings
  alter column time_slots_lunch_max_groups set default 5,
  alter column time_slots_dinner_max_groups set default 8,
  alter column time_slots_max_party_size set default 8;

alter table public.restaurant_settings
  alter column time_slots_lunch_max_groups set not null,
  alter column time_slots_dinner_max_groups set not null,
  alter column time_slots_max_party_size set not null;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_time_slots_lunch_max_groups_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_time_slots_lunch_max_groups_check
  check (time_slots_lunch_max_groups between 1 and 100);

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_time_slots_dinner_max_groups_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_time_slots_dinner_max_groups_check
  check (time_slots_dinner_max_groups between 1 and 100);

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_time_slots_max_party_size_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_time_slots_max_party_size_check
  check (time_slots_max_party_size between 2 and 30);

comment on column public.restaurant_settings.time_slots_lunch_max_groups is
  'Mode time_slots : groupes max simultanés par créneau (service midi).';
comment on column public.restaurant_settings.time_slots_dinner_max_groups is
  'Mode time_slots : groupes max simultanés par créneau (service soir).';
comment on column public.restaurant_settings.time_slots_max_party_size is
  'Mode time_slots : taille max d''un groupe en ligne ; au-delà, contact téléphonique.';

-- ---------------------------------------------------------------------------
-- 3) Backfill global_covers (couverts + durées)
-- ---------------------------------------------------------------------------
with lunch_covers_updates as (
  update public.restaurant_settings
  set service_lunch_max_covers = 40
  where service_lunch_max_covers is null
     or service_lunch_max_covers <= 0
  returning restaurant_id
),
dinner_covers_updates as (
  update public.restaurant_settings
  set service_dinner_max_covers = 50
  where service_dinner_max_covers is null
     or service_dinner_max_covers <= 0
  returning restaurant_id
),
duration_clamp as (
  update public.restaurant_settings
  set
    lunch_duration_minutes = least(
      greatest(
        coalesce(lunch_duration_minutes, reservation_duration, 90),
        30
      ),
      240
    ),
    dinner_duration_minutes = least(
      greatest(
        coalesce(dinner_duration_minutes, reservation_duration, 120),
        30
      ),
      240
    )
  where lunch_duration_minutes is null
     or dinner_duration_minutes is null
     or lunch_duration_minutes < 30
     or lunch_duration_minutes > 240
     or dinner_duration_minutes < 30
     or dinner_duration_minutes > 240
  returning restaurant_id
)
insert into public.schema_migration_audit (migration_name, batch_id, details)
select
  '20260523120000_reservation_dual_modes_schema',
  gen_random_uuid(),
  jsonb_build_object(
    'phase', 'backfill_global_covers',
    'lunch_max_covers_updated', (select count(*)::integer from lunch_covers_updates),
    'dinner_max_covers_updated', (select count(*)::integer from dinner_covers_updates),
    'durations_clamped_or_set', (select count(*)::integer from duration_clamp)
  );

-- Sécurité : aucune durée null avant contraintes
update public.restaurant_settings
set
  lunch_duration_minutes = least(
    greatest(coalesce(lunch_duration_minutes, reservation_duration, 90), 30),
    240
  ),
  dinner_duration_minutes = least(
    greatest(coalesce(dinner_duration_minutes, reservation_duration, 120), 30),
    240
  )
where lunch_duration_minutes is null
   or dinner_duration_minutes is null;

alter table public.restaurant_settings
  alter column lunch_duration_minutes set default 90,
  alter column dinner_duration_minutes set default 120;

-- ---------------------------------------------------------------------------
-- 4) Contraintes durées (30–240 min) et max_party_size (2–30)
-- ---------------------------------------------------------------------------
update public.restaurant_settings
set max_party_size = least(greatest(coalesce(max_party_size, 8), 2), 30)
where max_party_size is null
   or max_party_size < 2
   or max_party_size > 30;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_lunch_duration_minutes_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_lunch_duration_minutes_check
  check (lunch_duration_minutes between 30 and 240);

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_dinner_duration_minutes_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_dinner_duration_minutes_check
  check (dinner_duration_minutes between 30 and 240);

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_max_party_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_max_party_check
  check (max_party_size between 2 and 30);

-- ---------------------------------------------------------------------------
-- 5) Audit final
-- ---------------------------------------------------------------------------
insert into public.schema_migration_audit (migration_name, batch_id, details)
select
  '20260523120000_reservation_dual_modes_schema',
  gen_random_uuid(),
  jsonb_build_object(
    'phase', 'complete',
    'total_restaurants', (select count(*)::integer from public.restaurant_settings),
    'global_covers_count', (
      select count(*)::integer
      from public.restaurant_settings
      where reservation_mode = 'global_covers'
    ),
    'time_slots_count', (
      select count(*)::integer
      from public.restaurant_settings
      where reservation_mode = 'time_slots'
    )
  );
