-- Plan de salle (premium) : zones + statut tables + assignation "à placer" côté dashboard
-- Objectifs:
-- - Ajouter des zones custom (salle principale, terrasse, etc.)
-- - Étendre restaurant_tables (zone_id, status, note, sort_order)
-- - Paramètres: durées midi/soir + assignation auto activable
-- - Ne pas casser l'existant: page publique reste stricte (pas de réservation sans table en mode physical_tables)

-- ---------------------------------------------------------------------------
-- 1) ZONES
-- ---------------------------------------------------------------------------
create table if not exists public.restaurant_zones (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists restaurant_zones_restaurant_id_idx
  on public.restaurant_zones (restaurant_id);

-- ---------------------------------------------------------------------------
-- 2) TABLES : extension (zone + statut + note + tri)
-- ---------------------------------------------------------------------------
alter table public.restaurant_tables
  add column if not exists zone_id uuid references public.restaurant_zones(id) on delete set null,
  add column if not exists status text not null default 'active',
  add column if not exists note text,
  add column if not exists sort_order integer not null default 0;

alter table public.restaurant_tables
  drop constraint if exists restaurant_tables_status_check;

alter table public.restaurant_tables
  add constraint restaurant_tables_status_check
  check (status in ('active', 'inactive', 'blocked'));

create index if not exists restaurant_tables_zone_id_idx
  on public.restaurant_tables (zone_id);

create index if not exists restaurant_tables_status_idx
  on public.restaurant_tables (restaurant_id, status);

-- ---------------------------------------------------------------------------
-- 3) SETTINGS : durées midi/soir + assignation auto
-- ---------------------------------------------------------------------------
alter table public.restaurant_settings
  add column if not exists floor_plan_auto_assign boolean not null default true,
  add column if not exists floor_plan_lunch_duration integer,
  add column if not exists floor_plan_dinner_duration integer;

update public.restaurant_settings
set
  floor_plan_lunch_duration = coalesce(floor_plan_lunch_duration, reservation_duration, 90),
  floor_plan_dinner_duration = coalesce(floor_plan_dinner_duration, reservation_duration, 90)
where floor_plan_lunch_duration is null or floor_plan_dinner_duration is null;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_floor_plan_lunch_duration_check;
alter table public.restaurant_settings
  add constraint restaurant_settings_floor_plan_lunch_duration_check
  check (floor_plan_lunch_duration is null or floor_plan_lunch_duration > 0);

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_floor_plan_dinner_duration_check;
alter table public.restaurant_settings
  add constraint restaurant_settings_floor_plan_dinner_duration_check
  check (floor_plan_dinner_duration is null or floor_plan_dinner_duration > 0);

-- ---------------------------------------------------------------------------
-- 4) Backfill: créer une zone par défaut si des tables existent sans zone
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  z_id uuid;
begin
  for r in
    select distinct restaurant_id
    from public.restaurant_tables
    where zone_id is null
  loop
    insert into public.restaurant_zones (restaurant_id, name, description, is_active)
    values (r.restaurant_id, 'Salle principale', 'Zone par défaut', true)
    returning id into z_id;

    update public.restaurant_tables
    set zone_id = z_id
    where restaurant_id = r.restaurant_id
      and zone_id is null;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 5) RLS restaurant_zones
-- ---------------------------------------------------------------------------
alter table public.restaurant_zones enable row level security;

drop policy if exists "restaurant_zones_owner_select" on public.restaurant_zones;
create policy "restaurant_zones_owner_select"
on public.restaurant_zones for select
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_zones.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "restaurant_zones_owner_insert" on public.restaurant_zones;
create policy "restaurant_zones_owner_insert"
on public.restaurant_zones for insert
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_zones.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "restaurant_zones_owner_update" on public.restaurant_zones;
create policy "restaurant_zones_owner_update"
on public.restaurant_zones for update
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_zones.restaurant_id and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_zones.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "restaurant_zones_owner_delete" on public.restaurant_zones;
create policy "restaurant_zones_owner_delete"
on public.restaurant_zones for delete
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_zones.restaurant_id and r.owner_id = auth.uid()
  )
);

-- Optionnel: lecture publique désactivée par défaut (contrairement à restaurant_tables)

-- ---------------------------------------------------------------------------
-- 6) RPC: replace_restaurant_tables -> conserve compatibilité, remplit zone/status
-- ---------------------------------------------------------------------------
create or replace function public.replace_restaurant_tables(
  p_restaurant_id uuid,
  p_tables jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_zone_id uuid;
begin
  select owner_id into v_owner from public.restaurants where id = p_restaurant_id;
  if v_owner is null then
    raise exception 'RESTAURANT_NOT_FOUND';
  end if;
  if v_owner is distinct from auth.uid() then
    raise exception 'FORBIDDEN';
  end if;

  -- Zone par défaut si absente
  select id into v_zone_id
  from public.restaurant_zones
  where restaurant_id = p_restaurant_id
  order by created_at asc
  limit 1;

  if v_zone_id is null then
    insert into public.restaurant_zones (restaurant_id, name, description, is_active)
    values (p_restaurant_id, 'Salle principale', 'Zone par défaut', true)
    returning id into v_zone_id;
  end if;

  delete from public.restaurant_tables where restaurant_id = p_restaurant_id;

  if p_tables is null or jsonb_typeof(p_tables) <> 'array' or jsonb_array_length(p_tables) = 0 then
    return;
  end if;

  insert into public.restaurant_tables (restaurant_id, zone_id, name, min_covers, max_covers, status, sort_order)
  select
    p_restaurant_id,
    v_zone_id,
    btrim(t->>'name'),
    greatest(1, least(20, coalesce((t->>'min_covers')::integer, 1))),
    greatest(1, least(20, coalesce((t->>'max_covers')::integer, 1))),
    'active',
    coalesce((t->>'sort_order')::integer, 0)
  from jsonb_array_elements(p_tables) as t;
end;
$$;

grant execute on function public.replace_restaurant_tables(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 7) Disponibilités / création publique : ignorer tables inactives/bloquées
--    NB: on ne change PAS la règle publique : si pas de table -> SLOT_FULL.
-- ---------------------------------------------------------------------------
-- Filtre status='active' dans les deux RPC clés.
-- (On patch les fonctions existantes; si elles n'existent pas, la migration échouera et doit être rejouée après init.)

-- create_public_reservation
create or replace function public.create_public_reservation(
  p_restaurant_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_guests integer,
  p_reservation_date date,
  p_reservation_time text,
  p_status text,
  p_source text,
  p_zone text default 'interior'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings record;
  v_table_id uuid;
  v_id uuid;
  v_st text;
  v_used integer;
  v_max_covers integer;
  v_terrace_capacity integer;
  v_duration integer;
  v_new_start timestamp;
  v_new_end timestamp;
  v_zone text;
  v_use_tables boolean;
  v_terrace_enabled boolean;
  v_cap integer;
  v_mode text;
  v_bucket text;
  v_lunch_en boolean;
  v_lunch_s time;
  v_lunch_e time;
  v_lunch_max integer;
  v_din_en boolean;
  v_din_s time;
  v_din_e time;
  v_din_max integer;
  v_oh jsonb;
  v_slot_interval integer;
begin
  if p_status not in ('pending', 'confirmed') then
    raise exception 'INVALID_STATUS';
  end if;

  if p_guests is null or p_guests <= 0 then
    raise exception 'INVALID_GUESTS';
  end if;

  perform pg_advisory_xact_lock(
    hashtext(p_restaurant_id::text || '|' || p_reservation_date::text)
  );

  select *
  into v_settings
  from public.restaurant_settings
  where restaurant_id = p_restaurant_id;

  if not found then
    raise exception 'SETTINGS_NOT_FOUND';
  end if;

  v_mode := coalesce(v_settings.reservation_mode, 'fixed_slots');
  v_zone := lower(trim(coalesce(p_zone, 'interior')));
  if v_zone not in ('interior', 'terrace') then
    v_zone := 'interior';
  end if;

  v_terrace_enabled := coalesce(v_settings.terrace_enabled, false);
  if not v_terrace_enabled then
    v_zone := 'interior';
  end if;

  v_use_tables := coalesce(v_settings.use_tables, false);
  v_max_covers := coalesce(v_settings.max_covers_per_slot, v_settings.restaurant_capacity, 40);
  v_terrace_capacity := coalesce(v_settings.terrace_capacity, 0);
  v_duration := coalesce(v_settings.reservation_duration, 90);
  if v_duration is null or v_duration <= 0 then v_duration := 90; end if;
  v_slot_interval := coalesce(v_settings.reservation_slot_interval, 30);
  if v_slot_interval is null or v_slot_interval <= 0 then v_slot_interval := 30; end if;

  v_oh := v_settings.opening_hours;
  v_lunch_en := coalesce(v_settings.service_lunch_enabled, true);
  v_lunch_s := v_settings.service_lunch_start;
  v_lunch_e := v_settings.service_lunch_end;
  v_lunch_max := coalesce(v_settings.service_lunch_max_covers, 40);
  v_din_en := coalesce(v_settings.service_dinner_enabled, true);
  v_din_s := v_settings.service_dinner_start;
  v_din_e := v_settings.service_dinner_end;
  v_din_max := coalesce(v_settings.service_dinner_max_covers, 40);

  v_new_start := (p_reservation_date::text || ' ' || left(trim(p_reservation_time), 5))::timestamp;
  v_new_end := v_new_start + make_interval(mins => v_duration);

  if v_mode = 'single_service' then
    v_table_id := null;

    if not public.zengrow_time_in_opening_hours(p_reservation_date, p_reservation_time, v_oh) then
      raise exception 'INVALID_SLOT';
    end if;

    v_bucket := public.zengrow_ss_service_bucket(
      p_reservation_time,
      v_lunch_en,
      v_lunch_s,
      v_lunch_e,
      v_din_en,
      v_din_s,
      v_din_e
    );

    if v_bucket is null then
      raise exception 'INVALID_SLOT';
    end if;

    if mod(public.zengrow_time_to_minutes(left(trim(p_reservation_time), 5)), 15) <> 0 then
      raise exception 'INVALID_SLOT';
    end if;

    if v_zone = 'terrace' and v_terrace_capacity <= 0 then
      raise exception 'SLOT_FULL';
    end if;

    v_cap := case
      when v_zone = 'terrace' then v_terrace_capacity
      when v_bucket = 'lunch' then v_lunch_max
      else v_din_max
    end;

    select coalesce(sum(r.guests), 0)
    into v_used
    from public.reservations r
    where r.restaurant_id = p_restaurant_id
      and r.reservation_date = p_reservation_date
      and r.status in ('pending', 'confirmed')
      and coalesce(r.zone, 'interior') = v_zone
      and public.zengrow_ss_service_bucket(
        r.reservation_time,
        v_lunch_en,
        v_lunch_s,
        v_lunch_e,
        v_din_en,
        v_din_s,
        v_din_e
      ) = v_bucket;

    if (v_used + p_guests) > v_cap then
      raise exception 'SLOT_FULL';
    end if;

  elsif v_mode = 'fixed_slots' then
    v_table_id := null;

    if not public.zengrow_fixed_slot_valid(p_reservation_date, p_reservation_time, v_duration, v_oh) then
      raise exception 'INVALID_SLOT';
    end if;

    if v_zone = 'terrace' and v_terrace_capacity <= 0 then
      raise exception 'SLOT_FULL';
    end if;

    v_cap := case when v_zone = 'terrace' then v_terrace_capacity else v_max_covers end;

    select coalesce(sum(r.guests), 0)
    into v_used
    from public.reservations r
    where r.restaurant_id = p_restaurant_id
      and r.reservation_date = p_reservation_date
      and r.reservation_time = left(trim(p_reservation_time), 5)
      and r.status in ('pending', 'confirmed')
      and coalesce(r.zone, 'interior') = v_zone;

    if (v_used + p_guests) > v_cap then
      raise exception 'SLOT_FULL';
    end if;

  elsif v_mode = 'physical_tables' then
    if v_use_tables and v_zone = 'interior' then
      select t.id
      into v_table_id
      from public.restaurant_tables t
      where t.restaurant_id = p_restaurant_id
        and t.status = 'active'
        and t.min_covers <= p_guests
        and t.max_covers >= p_guests
        and not exists (
          select 1
          from public.reservations r
          where r.table_id = t.id
            and r.reservation_date = p_reservation_date
            and r.status in ('pending', 'confirmed')
            and coalesce(r.zone, 'interior') = 'interior'
            and ((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) < v_new_end
            and (((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) + make_interval(mins => v_duration)) > v_new_start
        )
      order by t.max_covers asc, t.min_covers asc
      limit 1;

      if v_table_id is null then
        raise exception 'SLOT_FULL';
      end if;

    elsif v_use_tables and v_zone = 'terrace' then
      v_table_id := null;

      select coalesce(sum(r.guests), 0)
      into v_used
      from public.reservations r
      where r.restaurant_id = p_restaurant_id
        and r.reservation_date = p_reservation_date
        and r.status in ('pending', 'confirmed')
        and coalesce(r.zone, 'interior') = 'terrace'
        and ((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) < v_new_end
        and (((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) + make_interval(mins => v_duration)) > v_new_start;

      if v_terrace_capacity <= 0 or (v_used + p_guests) > v_terrace_capacity then
        raise exception 'SLOT_FULL';
      end if;

    else
      v_table_id := null;

      v_cap := case when v_zone = 'terrace' then v_terrace_capacity else v_max_covers end;

      select coalesce(sum(r.guests), 0)
      into v_used
      from public.reservations r
      where r.restaurant_id = p_restaurant_id
        and r.reservation_date = p_reservation_date
        and r.status in ('pending', 'confirmed')
        and coalesce(r.zone, 'interior') = v_zone
        and ((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) < v_new_end
        and (((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) + make_interval(mins => v_duration)) > v_new_start;

      if v_zone = 'terrace' and v_terrace_capacity <= 0 then
        raise exception 'SLOT_FULL';
      end if;

      if (v_used + p_guests) > v_cap then
        raise exception 'SLOT_FULL';
      end if;
    end if;
  end if;

  insert into public.reservations (
    restaurant_id,
    guest_name,
    guest_email,
    guest_phone,
    guests,
    reservation_date,
    reservation_time,
    status,
    source,
    table_id,
    zone
  )
  values (
    p_restaurant_id,
    coalesce(nullif(trim(p_guest_name), ''), 'Client'),
    nullif(trim(p_guest_email), ''),
    nullif(trim(p_guest_phone), ''),
    p_guests,
    p_reservation_date,
    left(trim(p_reservation_time), 5),
    p_status,
    coalesce(nullif(trim(p_source), ''), 'public_link'),
    v_table_id,
    v_zone
  )
  returning id, status into v_id, v_st;

  return jsonb_build_object('id', v_id, 'status', v_st);
end;
$$;

grant execute on function public.create_public_reservation(
  uuid, text, text, text, integer, date, text, text, text, text
) to anon, authenticated;

-- get_available_slots: ignorer les tables inactive/bloquées (status <> active)
create or replace function public.get_available_slots(
  p_restaurant_id uuid,
  p_date date,
  p_covers integer,
  p_zone text default 'interior'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  s record;
  v_interval integer;
  v_duration integer;
  v_max_party integer;
  v_max_covers integer;
  v_terrace_capacity integer;
  v_terrace_enabled boolean;
  v_use_tables boolean;
  v_days integer;
  v_oh jsonb;
  v_key text;
  v_ranges jsonb;
  v_i integer;
  v_range jsonb;
  v_start integer;
  v_end integer;
  v_cur integer;
  v_slot text;
  v_result jsonb := '[]'::jsonb;
  v_elem jsonb;
  v_used integer;
  v_ok boolean;
  v_tid uuid;
  v_dow integer;
  v_cutoff integer := -1;
  v_slot_min integer;
  v_blocked boolean;
  v_zone text;
  v_cap integer;
  v_mode text;
  v_bucket text;
  v_lunch_en boolean;
  v_lunch_s time;
  v_lunch_e time;
  v_lunch_max integer;
  v_din_en boolean;
  v_din_s time;
  v_din_e time;
  v_din_max integer;
  v_is integer;
  v_ie integer;
  v_lunch_start_min integer;
  v_lunch_end_min integer;
  v_dinner_start_min integer;
  v_dinner_end_min integer;
  v_step integer := 15;
begin
  if p_covers is null or p_covers <= 0 then
    return '[]'::jsonb;
  end if;

  select
    rs.reservation_mode,
    rs.reservation_slot_interval,
    rs.reservation_duration,
    rs.max_party_size,
    rs.max_covers_per_slot,
    rs.restaurant_capacity,
    rs.use_tables,
    rs.days_in_advance,
    rs.opening_hours,
    rs.closure_start_date,
    rs.closure_end_date,
    rs.terrace_enabled,
    rs.terrace_capacity,
    coalesce(rs.service_lunch_enabled, true) as service_lunch_enabled,
    rs.service_lunch_start,
    rs.service_lunch_end,
    coalesce(rs.service_lunch_max_covers, 40) as service_lunch_max_covers,
    coalesce(rs.service_dinner_enabled, true) as service_dinner_enabled,
    rs.service_dinner_start,
    rs.service_dinner_end,
    coalesce(rs.service_dinner_max_covers, 40) as service_dinner_max_covers
  into s
  from public.restaurant_settings rs
  where rs.restaurant_id = p_restaurant_id;

  if not found then
    return '[]'::jsonb;
  end if;

  v_mode := coalesce(s.reservation_mode, 'fixed_slots');

  v_zone := lower(trim(coalesce(p_zone, 'interior')));
  if v_zone not in ('interior', 'terrace') then
    v_zone := 'interior';
  end if;

  v_terrace_enabled := coalesce(s.terrace_enabled, false);
  if not v_terrace_enabled then
    v_zone := 'interior';
  end if;

  v_terrace_capacity := coalesce(s.terrace_capacity, 0);

  if v_zone = 'terrace' and v_terrace_capacity <= 0 then
    return '[]'::jsonb;
  end if;

  v_interval := coalesce(s.reservation_slot_interval, 30);
  v_duration := coalesce(s.reservation_duration, 90);
  v_max_party := coalesce(s.max_party_size, 8);
  v_max_covers := coalesce(s.max_covers_per_slot, s.restaurant_capacity, 40);
  v_use_tables := coalesce(s.use_tables, false);
  v_days := coalesce(s.days_in_advance, 60);
  v_oh := s.opening_hours;
  if v_duration is null or v_duration <= 0 then v_duration := 90; end if;

  v_lunch_en := coalesce(s.service_lunch_enabled, true);
  v_lunch_s := s.service_lunch_start;
  v_lunch_e := s.service_lunch_end;
  v_lunch_max := coalesce(s.service_lunch_max_covers, 40);
  v_din_en := coalesce(s.service_dinner_enabled, true);
  v_din_s := s.service_dinner_start;
  v_din_e := s.service_dinner_end;
  v_din_max := coalesce(s.service_dinner_max_covers, 40);

  v_cap := case when v_zone = 'terrace' then v_terrace_capacity else v_max_covers end;

  if p_covers > v_max_party then
    return '[]'::jsonb;
  end if;

  if p_date < current_date or p_date > current_date + (v_days || ' days')::interval then
    return '[]'::jsonb;
  end if;

  if s.closure_start_date is not null
     and s.closure_end_date is not null
     and p_date >= s.closure_start_date
     and p_date <= s.closure_end_date then
    return '[]'::jsonb;
  end if;

  if p_date = current_date then
    v_cutoff := extract(hour from current_time)::integer * 60 + extract(minute from current_time)::integer;
  end if;

  v_dow := extract(dow from p_date)::integer;
  v_key := case v_dow
    when 0 then 'sun'
    when 1 then 'mon'
    when 2 then 'tue'
    when 3 then 'wed'
    when 4 then 'thu'
    when 5 then 'fri'
    when 6 then 'sat'
  end;

  if v_oh is null then
    v_oh := public.zengrow_default_opening_hours();
  end if;

  v_ranges := v_oh -> v_key;
  if v_ranges is null or jsonb_typeof(v_ranges) <> 'array' then
    return '[]'::jsonb;
  end if;

  if v_mode = 'single_service' then
    v_lunch_start_min := public.zengrow_time_to_minutes(to_char(v_lunch_s, 'HH24:MI'));
    v_lunch_end_min := public.zengrow_time_to_minutes(to_char(v_lunch_e, 'HH24:MI'));
    v_dinner_start_min := public.zengrow_time_to_minutes(to_char(v_din_s, 'HH24:MI'));
    v_dinner_end_min := public.zengrow_time_to_minutes(to_char(v_din_e, 'HH24:MI'));

    for v_i in 0 .. jsonb_array_length(v_ranges) - 1 loop
      v_range := v_ranges -> v_i;
      v_start := public.zengrow_time_to_minutes(v_range ->> 'start');
      v_end := public.zengrow_time_to_minutes(v_range ->> 'end');

      if v_lunch_en then
        v_is := greatest(v_start, v_lunch_start_min);
        v_ie := least(v_end, v_lunch_end_min);
        if v_is < v_ie then
          v_cur := ((v_is + v_step - 1) / v_step) * v_step;
          while v_cur < v_ie loop
            v_slot := public.zengrow_minutes_to_time(v_cur);
            v_slot_min := v_cur;

            select exists (
              select 1 from public.blocked_slots b
              where b.restaurant_id = p_restaurant_id
                and b.reservation_date = p_date
                and b.reservation_time = v_slot
            ) into v_blocked;

            if not v_blocked and (v_cutoff < 0 or v_slot_min >= v_cutoff) then
              v_bucket := 'lunch';
              v_cap := case when v_zone = 'terrace' then v_terrace_capacity else v_lunch_max end;

              select coalesce(sum(r.guests), 0)
              into v_used
              from public.reservations r
              where r.restaurant_id = p_restaurant_id
                and r.reservation_date = p_date
                and r.status in ('pending', 'confirmed')
                and coalesce(r.zone, 'interior') = v_zone
                and public.zengrow_ss_service_bucket(
                  r.reservation_time,
                  v_lunch_en,
                  v_lunch_s,
                  v_lunch_e,
                  v_din_en,
                  v_din_s,
                  v_din_e
                ) = v_bucket;

              if (v_used + p_covers) <= v_cap then
                v_elem := jsonb_build_object(
                  'time', v_slot,
                  'suggestedTableId', null,
                  'remainingCapacity', greatest(v_cap - v_used - p_covers, 0)
                );
                v_result := v_result || jsonb_build_array(v_elem);
              end if;
            end if;

            v_cur := v_cur + v_step;
          end loop;
        end if;
      end if;

      if v_din_en then
        v_is := greatest(v_start, v_dinner_start_min);
        v_ie := least(v_end, v_dinner_end_min);
        if v_is < v_ie then
          v_cur := ((v_is + v_step - 1) / v_step) * v_step;
          while v_cur < v_ie loop
            v_slot := public.zengrow_minutes_to_time(v_cur);
            v_slot_min := v_cur;

            if v_lunch_en and v_cur >= v_lunch_start_min and v_cur < v_lunch_end_min then
              v_cur := v_cur + v_step;
              continue;
            end if;

            select exists (
              select 1 from public.blocked_slots b
              where b.restaurant_id = p_restaurant_id
                and b.reservation_date = p_date
                and b.reservation_time = v_slot
            ) into v_blocked;

            if not v_blocked and (v_cutoff < 0 or v_slot_min >= v_cutoff) then
              v_bucket := 'dinner';
              v_cap := case when v_zone = 'terrace' then v_terrace_capacity else v_din_max end;

              select coalesce(sum(r.guests), 0)
              into v_used
              from public.reservations r
              where r.restaurant_id = p_restaurant_id
                and r.reservation_date = p_date
                and r.status in ('pending', 'confirmed')
                and coalesce(r.zone, 'interior') = v_zone
                and public.zengrow_ss_service_bucket(
                  r.reservation_time,
                  v_lunch_en,
                  v_lunch_s,
                  v_lunch_e,
                  v_din_en,
                  v_din_s,
                  v_din_e
                ) = v_bucket;

              if (v_used + p_covers) <= v_cap then
                v_elem := jsonb_build_object(
                  'time', v_slot,
                  'suggestedTableId', null,
                  'remainingCapacity', greatest(v_cap - v_used - p_covers, 0)
                );
                v_result := v_result || jsonb_build_array(v_elem);
              end if;
            end if;

            v_cur := v_cur + v_step;
          end loop;
        end if;
      end if;
    end loop;

    return v_result;
  end if;

  if v_mode = 'fixed_slots' then
    for v_i in 0 .. jsonb_array_length(v_ranges) - 1 loop
      v_range := v_ranges -> v_i;
      v_start := public.zengrow_time_to_minutes(v_range ->> 'start');
      v_end := public.zengrow_time_to_minutes(v_range ->> 'end');
      v_cur := v_start;

      while v_cur + v_duration <= v_end loop
        v_slot := public.zengrow_minutes_to_time(v_cur);
        v_slot_min := v_cur;

        select exists (
          select 1 from public.blocked_slots b
          where b.restaurant_id = p_restaurant_id
            and b.reservation_date = p_date
            and b.reservation_time = v_slot
        ) into v_blocked;

        if not v_blocked and (v_cutoff < 0 or v_slot_min >= v_cutoff) then
          select coalesce(sum(r.guests), 0)
          into v_used
          from public.reservations r
          where r.restaurant_id = p_restaurant_id
            and r.reservation_date = p_date
            and r.reservation_time = v_slot
            and r.status in ('pending', 'confirmed')
            and coalesce(r.zone, 'interior') = v_zone;

          if (v_used + p_covers) <= v_cap then
            v_elem := jsonb_build_object(
              'time', v_slot,
              'suggestedTableId', null,
              'remainingCapacity', greatest(v_cap - v_used - p_covers, 0)
            );
            v_result := v_result || jsonb_build_array(v_elem);
          end if;
        end if;

        v_cur := v_cur + v_duration;
      end loop;
    end loop;

    return v_result;
  end if;

  for v_i in 0 .. jsonb_array_length(v_ranges) - 1 loop
    v_range := v_ranges -> v_i;
    v_start := public.zengrow_time_to_minutes(v_range ->> 'start');
    v_end := public.zengrow_time_to_minutes(v_range ->> 'end');
    v_cur := v_start;

    while v_cur <= v_end - v_interval loop
      v_slot := public.zengrow_minutes_to_time(v_cur);
      v_slot_min := v_cur;

      select exists (
        select 1 from public.blocked_slots b
        where b.restaurant_id = p_restaurant_id
          and b.reservation_date = p_date
          and b.reservation_time = v_slot
      ) into v_blocked;

      if not v_blocked and (v_cutoff < 0 or v_slot_min >= v_cutoff) then
        v_ok := false;
        v_tid := null;

        if v_use_tables and v_zone = 'interior' then
          select t.id
          into v_tid
          from public.restaurant_tables t
          where t.restaurant_id = p_restaurant_id
            and t.status = 'active'
            and t.min_covers <= p_covers
            and t.max_covers >= p_covers
            and not exists (
              select 1 from public.reservations r
              where r.table_id = t.id
                and r.reservation_date = p_date
                and r.status in ('pending', 'confirmed')
                and coalesce(r.zone, 'interior') = 'interior'
                and ((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) < ((p_date::text || ' ' || v_slot)::timestamp + make_interval(mins => v_duration))
                and (((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) + make_interval(mins => v_duration)) > ((p_date::text || ' ' || v_slot)::timestamp)
            )
          order by t.max_covers asc, t.min_covers asc
          limit 1;

          v_ok := v_tid is not null;

          if v_ok then
            v_elem := jsonb_build_object('time', v_slot, 'suggestedTableId', v_tid, 'remainingCapacity', null);
            v_result := v_result || jsonb_build_array(v_elem);
          end if;
        elsif v_use_tables and v_zone = 'terrace' then
          select coalesce(sum(r.guests), 0)
          into v_used
          from public.reservations r
          where r.restaurant_id = p_restaurant_id
            and r.reservation_date = p_date
            and r.status in ('pending', 'confirmed')
            and coalesce(r.zone, 'interior') = 'terrace'
            and ((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) < ((p_date::text || ' ' || v_slot)::timestamp + make_interval(mins => v_duration))
            and (((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) + make_interval(mins => v_duration)) > ((p_date::text || ' ' || v_slot)::timestamp);

          if (v_used + p_covers) <= v_cap then
            v_elem := jsonb_build_object(
              'time', v_slot,
              'suggestedTableId', null,
              'remainingCapacity', greatest(v_cap - v_used - p_covers, 0)
            );
            v_result := v_result || jsonb_build_array(v_elem);
          end if;
        else
          select coalesce(sum(r.guests), 0)
          into v_used
          from public.reservations r
          where r.restaurant_id = p_restaurant_id
            and r.reservation_date = p_date
            and r.status in ('pending', 'confirmed')
            and coalesce(r.zone, 'interior') = v_zone
            and ((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) < ((p_date::text || ' ' || v_slot)::timestamp + make_interval(mins => v_duration))
            and (((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) + make_interval(mins => v_duration)) > ((p_date::text || ' ' || v_slot)::timestamp);

          if (v_used + p_covers) <= v_cap then
            v_elem := jsonb_build_object(
              'time', v_slot,
              'suggestedTableId', null,
              'remainingCapacity', greatest(v_cap - v_used - p_covers, 0)
            );
            v_result := v_result || jsonb_build_array(v_elem);
          end if;
        end if;
      end if;

      v_cur := v_cur + v_interval;
    end loop;
  end loop;

  return v_result;
end;
$$;

grant execute on function public.get_available_slots(uuid, date, integer, text) to anon, authenticated;

