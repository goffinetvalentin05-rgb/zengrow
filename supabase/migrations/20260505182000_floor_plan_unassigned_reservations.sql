-- Autoriser les réservations "À placer" (table_id NULL) uniquement depuis le dashboard
-- sans impacter la page publique (qui passe par RPC create_public_reservation).
-- + Ignorer les tables non actives dans les vérifications de capacité table.

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

  if v_mode = 'physical_tables' then
    v_time := new.reservation_time::time;
    v_minutes := extract(hour from v_time)::integer * 60 + extract(minute from v_time)::integer;
    if mod(v_minutes, v_slot_interval) <> 0 then
      raise exception 'INVALID_SLOT';
    end if;

    v_new_start := (new.reservation_date::text || ' ' || new.reservation_time)::timestamp;
    v_new_end := v_new_start + make_interval(mins => v_duration);

    if v_use_tables and v_zone = 'interior' then
      -- Nouvel usage "Plan de salle": permettre une réservation sans table uniquement depuis le dashboard
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

