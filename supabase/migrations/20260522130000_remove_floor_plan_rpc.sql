-- Étape 2 — RPC et trigger : mode simple uniquement (plus de branche floor_plan)

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
  v_id uuid;
  v_st text;
  v_used integer;
  v_terrace_capacity integer;
  v_terrace_enabled boolean;
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
  v_zone text;
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

  v_zone := lower(trim(coalesce(p_zone, 'interior')));
  if v_zone not in ('interior', 'terrace') then
    v_zone := 'interior';
  end if;

  v_terrace_enabled := coalesce(v_settings.terrace_enabled, false);
  if not v_terrace_enabled then
    v_zone := 'interior';
  end if;

  v_terrace_capacity := coalesce(v_settings.terrace_capacity, 0);
  v_oh := v_settings.opening_hours;
  v_lunch_en := coalesce(v_settings.service_lunch_enabled, true);
  v_lunch_s := v_settings.service_lunch_start;
  v_lunch_e := v_settings.service_lunch_end;
  v_lunch_max := coalesce(v_settings.service_lunch_max_covers, 40);
  v_din_en := coalesce(v_settings.service_dinner_enabled, true);
  v_din_s := v_settings.service_dinner_start;
  v_din_e := v_settings.service_dinner_end;
  v_din_max := coalesce(v_settings.service_dinner_max_covers, 40);

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
    v_zone
  )
  returning id, status into v_id, v_st;

  return jsonb_build_object('id', v_id, 'status', v_st);
end;
$$;

grant execute on function public.create_public_reservation(
  uuid, text, text, text, integer, date, text, text, text, text
) to anon, authenticated;

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
  v_max_party integer;
  v_terrace_capacity integer;
  v_terrace_enabled boolean;
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
  v_dow integer;
  v_cutoff integer := -1;
  v_slot_min integer;
  v_blocked boolean;
  v_zone text;
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
    rs.max_party_size,
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

  v_max_party := coalesce(s.max_party_size, 8);
  v_days := coalesce(s.days_in_advance, 60);
  v_oh := s.opening_hours;

  v_lunch_en := coalesce(s.service_lunch_enabled, true);
  v_lunch_s := s.service_lunch_start;
  v_lunch_e := s.service_lunch_end;
  v_lunch_max := coalesce(s.service_lunch_max_covers, 40);
  v_din_en := coalesce(s.service_dinner_enabled, true);
  v_din_s := s.service_dinner_start;
  v_din_e := s.service_dinner_end;
  v_din_max := coalesce(s.service_dinner_max_covers, 40);

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

            if (v_used + p_covers) <= (case
              when v_zone = 'terrace' then v_terrace_capacity
              else v_lunch_max
            end) then
              v_elem := jsonb_build_object(
                'time', v_slot,
                'suggestedTableId', null,
                'remainingCapacity', null
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

            if (v_used + p_covers) <= (case
              when v_zone = 'terrace' then v_terrace_capacity
              else v_din_max
            end) then
              v_elem := jsonb_build_object(
                'time', v_slot,
                'suggestedTableId', null,
                'remainingCapacity', null
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
end;
$$;

grant execute on function public.get_available_slots(uuid, date, integer, text) to anon, authenticated;

create or replace function public.zengrow_check_reservation_capacity()
returns trigger
language plpgsql
as $$
declare
  v_max_party integer;
  v_terrace_enabled boolean;
  v_terrace_capacity integer;
  v_zone text;
  v_used integer;
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
    coalesce(s.max_party_size, 8),
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
    v_max_party,
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
end;
$$;
