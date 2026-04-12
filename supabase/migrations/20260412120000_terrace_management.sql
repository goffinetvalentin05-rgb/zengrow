-- Terrasse : capacité indépendante, zone sur les réservations, disponibilités et RPC alignés.

-- ---------------------------------------------------------------------------
-- 1) Paramètres restaurant
-- ---------------------------------------------------------------------------
alter table public.restaurant_settings
  add column if not exists terrace_enabled boolean not null default false,
  add column if not exists terrace_capacity integer not null default 0;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_terrace_capacity_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_terrace_capacity_check check (terrace_capacity >= 0);

-- ---------------------------------------------------------------------------
-- 2) Réservations : zone (intérieur / terrasse)
-- ---------------------------------------------------------------------------
alter table public.reservations
  add column if not exists zone text not null default 'interior';

update public.reservations
set zone = 'interior'
where zone is null or zone not in ('interior', 'terrace');

alter table public.reservations
  drop constraint if exists reservations_zone_check;

alter table public.reservations
  add constraint reservations_zone_check check (zone in ('interior', 'terrace'));

-- ---------------------------------------------------------------------------
-- 3) Capacité avant insert/update (zones indépendantes)
-- ---------------------------------------------------------------------------
create or replace function public.zengrow_check_reservation_capacity()
returns trigger
language plpgsql
as $$
declare
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
begin
  if new.status not in ('pending', 'confirmed') then
    return new;
  end if;

  perform pg_advisory_xact_lock(
    hashtext(new.restaurant_id::text || '|' || new.reservation_date::text)
  );

  select
    coalesce(s.max_covers_per_slot, s.restaurant_capacity, 40),
    coalesce(s.max_party_size, 8),
    coalesce(s.reservation_slot_interval, 30),
    coalesce(s.reservation_duration, 90),
    coalesce(s.use_tables, false),
    coalesce(s.terrace_enabled, false),
    coalesce(s.terrace_capacity, 0)
  into v_max_covers, v_max_party, v_slot_interval, v_duration, v_use_tables, v_terrace_enabled, v_terrace_capacity
  from public.restaurant_settings s
  where s.restaurant_id = new.restaurant_id;

  if v_max_covers is null then v_max_covers := 40; end if;
  if v_max_party is null then v_max_party := 8; end if;
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

  v_time := new.reservation_time::time;
  v_minutes := extract(hour from v_time)::integer * 60 + extract(minute from v_time)::integer;
  if mod(v_minutes, v_slot_interval) <> 0 then
    raise exception 'INVALID_SLOT';
  end if;

  v_new_start := (new.reservation_date::text || ' ' || new.reservation_time)::timestamp;
  v_new_end := v_new_start + make_interval(mins => v_duration);

  if v_zone = 'terrace' and v_terrace_capacity <= 0 then
    raise exception 'SLOT_FULL';
  end if;

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

  return new;
end;
$$;

drop trigger if exists zengrow_check_reservation_capacity_trigger on public.reservations;
create trigger zengrow_check_reservation_capacity_trigger
before insert or update of reservation_date, reservation_time, guests, status, table_id, restaurant_id, zone
on public.reservations
for each row
execute function public.zengrow_check_reservation_capacity();

-- ---------------------------------------------------------------------------
-- 4) RPC création publique
-- ---------------------------------------------------------------------------
drop function if exists public.create_public_reservation(uuid, text, text, text, integer, date, text, text, text);

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

  v_use_tables := coalesce(v_settings.use_tables, false);
  v_max_covers := coalesce(v_settings.max_covers_per_slot, v_settings.restaurant_capacity, 40);
  v_terrace_capacity := coalesce(v_settings.terrace_capacity, 0);
  v_duration := coalesce(v_settings.reservation_duration, 90);
  if v_duration is null or v_duration <= 0 then v_duration := 90; end if;

  v_new_start := (p_reservation_date::text || ' ' || left(trim(p_reservation_time), 5))::timestamp;
  v_new_end := v_new_start + make_interval(mins => v_duration);

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

-- ---------------------------------------------------------------------------
-- 5) Créneaux disponibles (paramètre zone)
-- ---------------------------------------------------------------------------
drop function if exists public.get_available_slots(uuid, date, integer);

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
begin
  if p_covers is null or p_covers <= 0 then
    return '[]'::jsonb;
  end if;

  select
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
    rs.terrace_capacity
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

  v_interval := coalesce(s.reservation_slot_interval, 30);
  v_duration := coalesce(s.reservation_duration, 90);
  v_max_party := coalesce(s.max_party_size, 8);
  v_max_covers := coalesce(s.max_covers_per_slot, s.restaurant_capacity, 40);
  v_use_tables := coalesce(s.use_tables, false);
  v_days := coalesce(s.days_in_advance, 60);
  v_oh := s.opening_hours;
  if v_duration is null or v_duration <= 0 then v_duration := 90; end if;

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

  for v_i in 0 .. jsonb_array_length(v_ranges) - 1 loop
    v_range := v_ranges -> v_i;
    v_start := public.zengrow_time_to_minutes(v_range ->> 'start');
    v_end := public.zengrow_time_to_minutes(v_range ->> 'end');
    v_cur := v_start;

    while v_cur <= v_end - v_interval loop
      v_slot := public.zengrow_minutes_to_time(v_cur);
      v_slot_min := v_cur;

      select exists (
        select 1
        from public.blocked_slots b
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
              select 1
              from public.reservations r
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
            v_elem := jsonb_build_object(
              'time', v_slot,
              'suggestedTableId', v_tid,
              'remainingCapacity', null
            );
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
