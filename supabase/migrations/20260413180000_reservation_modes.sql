-- Modes de réservation explicites : single_service | fixed_slots | physical_tables
-- Refonte capacité / créneaux / RPC alignés sur reservation_mode.

-- ---------------------------------------------------------------------------
-- 1) Colonnes configuration
-- ---------------------------------------------------------------------------
alter table public.restaurant_settings
  add column if not exists reservation_mode text not null default 'fixed_slots';

update public.restaurant_settings
set reservation_mode = case when coalesce(use_tables, false) then 'physical_tables' else 'fixed_slots' end
where reservation_mode is null or reservation_mode = 'fixed_slots';

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_reservation_mode_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_reservation_mode_check
  check (reservation_mode in ('single_service', 'fixed_slots', 'physical_tables'));

alter table public.restaurant_settings
  add column if not exists service_lunch_enabled boolean not null default true,
  add column if not exists service_lunch_start time not null default time '11:30',
  add column if not exists service_lunch_end time not null default time '14:30',
  add column if not exists service_lunch_max_covers integer not null default 40,
  add column if not exists service_dinner_enabled boolean not null default true,
  add column if not exists service_dinner_start time not null default time '18:00',
  add column if not exists service_dinner_end time not null default time '22:30',
  add column if not exists service_dinner_max_covers integer not null default 40;

update public.restaurant_settings
set
  service_lunch_max_covers = least(greatest(coalesce(max_covers_per_slot, restaurant_capacity, 40), 1), 500),
  service_dinner_max_covers = least(greatest(coalesce(max_covers_per_slot, restaurant_capacity, 40), 1), 500)
where true;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_service_lunch_max_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_service_lunch_max_check
  check (service_lunch_max_covers > 0 and service_lunch_max_covers <= 500);

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_service_dinner_max_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_service_dinner_max_check
  check (service_dinner_max_covers > 0 and service_dinner_max_covers <= 500);

update public.restaurant_settings
set use_tables = (reservation_mode = 'physical_tables');

-- ---------------------------------------------------------------------------
-- 2) Helpers
-- ---------------------------------------------------------------------------
create or replace function public.zengrow_time_in_opening_hours(p_date date, p_time text, p_oh jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  v_dow integer;
  v_key text;
  v_ranges jsonb;
  v_i integer;
  v_range jsonb;
  v_start integer;
  v_end integer;
  v_tm integer;
begin
  if p_time !~ '^\d{2}:\d{2}$' then
    return false;
  end if;

  v_tm := public.zengrow_time_to_minutes(left(trim(p_time), 5));
  if v_tm is null then
    return false;
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

  if p_oh is null then
    p_oh := public.zengrow_default_opening_hours();
  end if;

  v_ranges := p_oh -> v_key;
  if v_ranges is null or jsonb_typeof(v_ranges) <> 'array' then
    return false;
  end if;

  for v_i in 0 .. jsonb_array_length(v_ranges) - 1 loop
    v_range := v_ranges -> v_i;
    v_start := public.zengrow_time_to_minutes(v_range ->> 'start');
    v_end := public.zengrow_time_to_minutes(v_range ->> 'end');
    if v_tm >= v_start and v_tm < v_end then
      return true;
    end if;
  end loop;

  return false;
end;
$$;

create or replace function public.zengrow_ss_service_bucket(
  p_time text,
  p_lunch_en boolean,
  p_lunch_start time,
  p_lunch_end time,
  p_dinner_en boolean,
  p_dinner_start time,
  p_dinner_end time
)
returns text
language plpgsql
immutable
as $$
declare
  v_t time;
begin
  if p_time !~ '^\d{2}:\d{2}$' then
    return null;
  end if;

  v_t := left(trim(p_time), 5)::time;

  if p_lunch_en and v_t >= p_lunch_start and v_t < p_lunch_end then
    return 'lunch';
  end if;

  if p_dinner_en and v_t >= p_dinner_start and v_t < p_dinner_end then
    return 'dinner';
  end if;

  return null;
end;
$$;

create or replace function public.zengrow_fixed_slot_valid(
  p_date date,
  p_time text,
  p_duration integer,
  p_oh jsonb
)
returns boolean
language plpgsql
immutable
as $$
declare
  v_dow integer;
  v_key text;
  v_ranges jsonb;
  v_i integer;
  v_range jsonb;
  v_rs integer;
  v_re integer;
  v_tm integer;
  v_dur integer;
begin
  if p_time !~ '^\d{2}:\d{2}$' or p_duration is null or p_duration <= 0 then
    return false;
  end if;

  v_tm := public.zengrow_time_to_minutes(left(trim(p_time), 5));
  v_dur := p_duration;

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

  if p_oh is null then
    p_oh := public.zengrow_default_opening_hours();
  end if;

  v_ranges := p_oh -> v_key;
  if v_ranges is null or jsonb_typeof(v_ranges) <> 'array' then
    return false;
  end if;

  for v_i in 0 .. jsonb_array_length(v_ranges) - 1 loop
    v_range := v_ranges -> v_i;
    v_rs := public.zengrow_time_to_minutes(v_range ->> 'start');
    v_re := public.zengrow_time_to_minutes(v_range ->> 'end');
    if v_tm < v_rs or v_tm >= v_re then
      continue;
    end if;
    if (v_tm - v_rs) % v_dur <> 0 then
      continue;
    end if;
    if v_tm + v_dur > v_re then
      continue;
    end if;
    return true;
  end loop;

  return false;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3) Trigger capacité
-- ---------------------------------------------------------------------------
create or replace function public.zengrow_check_reservation_capacity()
returns trigger
language plpgsql
as $$
declare
  v_mode text;
  v_max_covers integer;
  v_max_party integer;
  v_slot_interval integer;
  v_duration integer;
  v_use_tables boolean;
  v_terrace_enabled boolean;
  v_terrace_capacity integer;
  v_zone text;
  v_used integer;
  v_time time;
  v_minutes integer;
  v_new_start timestamp;
  v_new_end timestamp;
  v_cap integer;
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
begin
  if new.status not in ('pending', 'confirmed') then
    return new;
  end if;

  perform pg_advisory_xact_lock(
    hashtext(new.restaurant_id::text || '|' || new.reservation_date::text)
  );

  select
    coalesce(s.reservation_mode, 'fixed_slots'),
    coalesce(s.max_covers_per_slot, s.restaurant_capacity, 40),
    coalesce(s.max_party_size, 8),
    coalesce(s.reservation_slot_interval, 30),
    coalesce(s.reservation_duration, 90),
    coalesce(s.use_tables, false),
    coalesce(s.terrace_enabled, false),
    coalesce(s.terrace_capacity, 0),
    s.opening_hours,
    coalesce(s.service_lunch_enabled, true),
    s.service_lunch_start,
    s.service_lunch_end,
    coalesce(s.service_lunch_max_covers, 40),
    coalesce(s.service_dinner_enabled, true),
    s.service_dinner_start,
    s.service_dinner_end,
    coalesce(s.service_dinner_max_covers, 40)
  into
    v_mode,
    v_max_covers,
    v_max_party,
    v_slot_interval,
    v_duration,
    v_use_tables,
    v_terrace_enabled,
    v_terrace_capacity,
    v_oh,
    v_lunch_en,
    v_lunch_s,
    v_lunch_e,
    v_lunch_max,
    v_din_en,
    v_din_s,
    v_din_e,
    v_din_max
  from public.restaurant_settings s
  where s.restaurant_id = new.restaurant_id;

  if v_slot_interval is null or v_slot_interval <= 0 then v_slot_interval := 30; end if;
  if v_duration is null or v_duration <= 0 then v_duration := 90; end if;

  v_zone := coalesce(nullif(trim(new.zone), ''), 'interior');
  if v_zone not in ('interior', 'terrace') then
    v_zone := 'interior';
  end if;

  if v_zone = 'terrace' and not v_terrace_enabled then
    raise exception 'TERRACE_DISABLED';
  end if;

  if new.guests > v_max_party then
    raise exception 'MAX_PARTY';
  end if;

  if new.reservation_time !~ '^\d{2}:\d{2}$' then
    raise exception 'INVALID_TIME';
  end if;

  if not public.zengrow_time_in_opening_hours(new.reservation_date, new.reservation_time, v_oh) then
    raise exception 'INVALID_SLOT';
  end if;

  -- Mode single_service : un total par service (midi / soir), pas de chevauchement entre créneaux
  if v_mode = 'single_service' then
    new.table_id := null;

    v_bucket := public.zengrow_ss_service_bucket(
      new.reservation_time,
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

    v_minutes := public.zengrow_time_to_minutes(left(trim(new.reservation_time), 5));
    if v_minutes is null or mod(v_minutes, 15) <> 0 then
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
    where r.restaurant_id = new.restaurant_id
      and r.reservation_date = new.reservation_date
      and r.status in ('pending', 'confirmed')
      and (tg_op = 'INSERT' or r.id <> new.id)
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

    if (v_used + new.guests) > v_cap then
      raise exception 'SLOT_FULL';
    end if;

    return new;
  end if;

  -- Mode fixed_slots : créneaux successifs sans chevauchement, capacité par heure exacte
  if v_mode = 'fixed_slots' then
    new.table_id := null;

    if not public.zengrow_fixed_slot_valid(new.reservation_date, new.reservation_time, v_duration, v_oh) then
      raise exception 'INVALID_SLOT';
    end if;

    if v_zone = 'terrace' and v_terrace_capacity <= 0 then
      raise exception 'SLOT_FULL';
    end if;

    v_cap := case when v_zone = 'terrace' then v_terrace_capacity else v_max_covers end;

    select coalesce(sum(r.guests), 0)
    into v_used
    from public.reservations r
    where r.restaurant_id = new.restaurant_id
      and r.reservation_date = new.reservation_date
      and r.reservation_time = new.reservation_time
      and r.status in ('pending', 'confirmed')
      and (tg_op = 'INSERT' or r.id <> new.id)
      and coalesce(r.zone, 'interior') = v_zone;

    if (v_used + new.guests) > v_cap then
      raise exception 'SLOT_FULL';
    end if;

    return new;
  end if;

  -- Mode physical_tables (tables + durée de rotation)
  if v_mode = 'physical_tables' then
  v_time := new.reservation_time::time;
  v_minutes := extract(hour from v_time)::integer * 60 + extract(minute from v_time)::integer;
  if mod(v_minutes, v_slot_interval) <> 0 then
    raise exception 'INVALID_SLOT';
  end if;

  v_new_start := (new.reservation_date::text || ' ' || new.reservation_time)::timestamp;
  v_new_end := v_new_start + make_interval(mins => v_duration);

  if v_use_tables and v_zone = 'interior' then
    if new.table_id is null then
      raise exception 'TABLE_REQUIRED';
    end if;

    if not exists (
      select 1
      from public.restaurant_tables t
      where t.id = new.table_id
        and t.restaurant_id = new.restaurant_id
        and t.min_covers <= new.guests
        and t.max_covers >= new.guests
    ) then
      raise exception 'TABLE_CAPACITY';
    end if;

    if exists (
      select 1
      from public.reservations r
      where r.restaurant_id = new.restaurant_id
        and r.table_id = new.table_id
        and r.reservation_date = new.reservation_date
        and r.status in ('pending', 'confirmed')
        and (tg_op = 'INSERT' or r.id <> new.id)
        and coalesce(r.zone, 'interior') = 'interior'
        and ((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) < v_new_end
        and (((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) + make_interval(mins => v_duration)) > v_new_start
    ) then
      raise exception 'TABLE_TAKEN';
    end if;

  elsif v_use_tables and v_zone = 'terrace' then
    new.table_id := null;

    select coalesce(sum(r.guests), 0)
    into v_used
    from public.reservations r
    where r.restaurant_id = new.restaurant_id
      and r.reservation_date = new.reservation_date
      and r.status in ('pending', 'confirmed')
      and (tg_op = 'INSERT' or r.id <> new.id)
      and coalesce(r.zone, 'interior') = 'terrace'
      and ((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) < v_new_end
      and (((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) + make_interval(mins => v_duration)) > v_new_start;

    if (v_used + new.guests) > v_terrace_capacity then
      raise exception 'SLOT_FULL';
    end if;

  else
    new.table_id := null;

    v_cap := case when v_zone = 'terrace' then v_terrace_capacity else v_max_covers end;

    select coalesce(sum(r.guests), 0)
    into v_used
    from public.reservations r
    where r.restaurant_id = new.restaurant_id
      and r.reservation_date = new.reservation_date
      and r.status in ('pending', 'confirmed')
      and (tg_op = 'INSERT' or r.id <> new.id)
      and coalesce(r.zone, 'interior') = v_zone
      and ((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) < v_new_end
      and (((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) + make_interval(mins => v_duration)) > v_new_start;

    if (v_used + new.guests) > v_cap then
      raise exception 'SLOT_FULL';
    end if;
  end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4) RPC création publique
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 5) Créneaux disponibles
-- ---------------------------------------------------------------------------
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
    coalesce(rs.service_lunch_enabled, true),
    rs.service_lunch_start,
    rs.service_lunch_end,
    coalesce(rs.service_lunch_max_covers, 40),
    coalesce(rs.service_dinner_enabled, true),
    rs.service_dinner_start,
    rs.service_dinner_end,
    coalesce(rs.service_dinner_max_covers, 40)
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

  -- Mode service unique : grille 15 min à l'intérieur des plages ouvertes ∩ service midi/soir
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

  -- Mode créneaux fixes successifs
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

  -- Mode tables physiques (comportement historique : intervalle + durée)
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
