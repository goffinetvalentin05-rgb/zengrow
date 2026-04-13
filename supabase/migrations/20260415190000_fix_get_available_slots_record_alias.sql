-- Hotfix: SELECT INTO record sans alias sur coalesce() => champs anonymes, accès s.service_* impossible.

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

  -- Mode service unique : grille 15 min Ã  l'intÃ©rieur des plages ouvertes âˆ© service midi/soir
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

  -- Mode crÃ©neaux fixes successifs
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

  -- Mode tables physiques (comportement historique : intervalle + durÃ©e)
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
