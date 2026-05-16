-- Surcharge manuelle de capacité (réservations admin en overbooking contrôlé).

alter table public.reservations
  add column if not exists capacity_override boolean not null default false;

create or replace function public.zengrow_check_reservation_capacity()
returns trigger
language plpgsql
as $$
declare
  v_mode text;
  v_max_party integer;
  v_duration integer;
  v_terrace_enabled boolean;
  v_terrace_capacity integer;
  v_zone text;
  v_used integer;
  v_new_start timestamp;
  v_new_end timestamp;
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
  if coalesce(new.capacity_override, false) then
    return new;
  end if;

  if new.status not in ('pending', 'confirmed') then
    return new;
  end if;

  perform pg_advisory_xact_lock(
    hashtext(new.restaurant_id::text || '|' || new.reservation_date::text)
  );

  select
    coalesce(s.reservation_mode, 'simple'),
    coalesce(s.max_party_size, 8),
    coalesce(s.reservation_duration, 90),
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
    v_max_party,
    v_duration,
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

  if v_mode = 'simple' then
    new.table_id := null;
    new.floor_plan_id := null;

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

    if mod(public.zengrow_time_to_minutes(left(trim(new.reservation_time), 5)), 15) <> 0 then
      raise exception 'INVALID_SLOT';
    end if;

    if v_zone = 'terrace' and v_terrace_capacity <= 0 then
      raise exception 'SLOT_FULL';
    end if;

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

    if (v_used + new.guests) > (case
      when v_zone = 'terrace' then v_terrace_capacity
      when v_bucket = 'lunch' then v_lunch_max
      else v_din_max
    end) then
      raise exception 'SLOT_FULL';
    end if;

    return new;
  end if;

  if v_mode = 'floor_plan' then
    v_new_start := (new.reservation_date::text || ' ' || new.reservation_time)::timestamp;
    v_new_end := v_new_start + make_interval(mins => v_duration);

    if new.table_id is null then
      if coalesce(new.source, '') = 'manual_dashboard' then
        new.floor_plan_id := null;
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
        and ((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) < v_new_end
        and (((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) + make_interval(mins => v_duration)) > v_new_start
    ) then
      raise exception 'TABLE_FULL';
    end if;

    if new.floor_plan_id is null then
      select t.floor_plan_id into new.floor_plan_id
      from public.restaurant_tables t
      where t.id = new.table_id;
    end if;

    return new;
  end if;

  return new;
end;
$$;
