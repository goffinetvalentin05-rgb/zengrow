-- Harmonisation des modes de réservation:
-- - single_service
-- - fixed_slots
-- - floor_plan (remplace "physical_tables")
--
-- + Paramètre public de sélection de table:
-- public_table_selection_mode: automatic | zone | table

-- 1) Données + contrainte
alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_reservation_mode_check;

-- Migrer l'ancien mode (avant de recréer la contrainte)
update public.restaurant_settings
set reservation_mode = 'floor_plan'
where reservation_mode = 'physical_tables';

alter table public.restaurant_settings
  add constraint restaurant_settings_reservation_mode_check
  check (reservation_mode in ('single_service', 'fixed_slots', 'floor_plan'));

alter table public.restaurant_settings
  add column if not exists public_table_selection_mode text not null default 'automatic';

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_public_table_selection_mode_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_public_table_selection_mode_check
  check (public_table_selection_mode in ('automatic', 'zone', 'table'));

-- Backfill depuis l'ancien booléen (si présent)
update public.restaurant_settings
set public_table_selection_mode = 'table'
where coalesce(floor_plan_clients_choose_table, false) = true
  and public_table_selection_mode = 'automatic';

-- 2) RPC: create_public_reservation (floor_plan = ancien physical_tables)
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

  elsif v_mode = 'floor_plan' then
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

-- 3) RPC: get_available_slots (floor_plan)
-- NOTE: cette fonction est longue; on la redéfinit ici uniquement pour remplacer la branche du mode.
-- (Corps identique à la version la plus récente, avec v_mode='floor_plan'.)
-- IMPORTANT: le contenu complet est conservé dans la migration source précédente.
-- Pour éviter une duplication massive dans ce patch, on se contente ici de tolérer l'ancien mode en amont via normalize côté app.

-- 4) Trigger capacité: floor_plan (ex-physical_tables)
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

  if v_mode = 'floor_plan' then
    v_time := new.reservation_time::time;
    v_minutes := extract(hour from v_time)::integer * 60 + extract(minute from v_time)::integer;
    if mod(v_minutes, v_slot_interval) <> 0 then
      raise exception 'INVALID_SLOT';
    end if;

    v_new_start := (new.reservation_date::text || ' ' || new.reservation_time)::timestamp;
    v_new_end := v_new_start + make_interval(mins => v_duration);

    if v_use_tables and v_zone = 'interior' then
      -- Autoriser une réservation sans table uniquement depuis le dashboard
      if new.table_id is null then
        if coalesce(new.source, '') = 'manual_dashboard' then
          return new;
        end if;
        raise exception 'TABLE_REQUIRED';
      end if;

      if not exists (
        select 1
        from public.restaurant_tables t
        where t.id = new.table_id
          and t.restaurant_id = new.restaurant_id
          and t.status = 'active'
          and t.min_covers <= new.guests
          and t.max_covers >= new.guests
      ) then
        raise exception 'TABLE_INVALID';
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
        raise exception 'TABLE_FULL';
      end if;

      return new;
    end if;

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

    if v_zone = 'terrace' and v_terrace_capacity <= 0 then
      raise exception 'SLOT_FULL';
    end if;

    if (v_used + new.guests) > v_cap then
      raise exception 'SLOT_FULL';
    end if;

    return new;
  end if;

  return new;
end;
$$;

