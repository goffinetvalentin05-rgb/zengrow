-- Réservation atomique (SELECT FOR UPDATE sur restaurant_settings), tables physiques optionnelles,
-- capacité par créneau, fonction get_available_slots, statut refused.

-- ---------------------------------------------------------------------------
-- 1) Statuts : refused (remplace rejected dans le modèle métier)
-- Il faut d'abord DROP la contrainte : l'ancienne autorise "rejected" mais pas "refused".
-- ---------------------------------------------------------------------------
alter table public.reservations
  drop constraint if exists reservations_status_check;

update public.reservations
set status = 'refused'
where status = 'rejected';

alter table public.reservations
  add constraint reservations_status_check
  check (status in ('pending', 'confirmed', 'refused', 'completed', 'cancelled', 'no-show'));

-- ---------------------------------------------------------------------------
-- 2) Paramètres restaurant : capacité par créneau, tables, horizon de réservation
-- ---------------------------------------------------------------------------
alter table public.restaurant_settings
  add column if not exists max_covers_per_slot integer,
  add column if not exists use_tables boolean not null default false,
  add column if not exists days_in_advance integer not null default 60;

update public.restaurant_settings
set max_covers_per_slot = coalesce(restaurant_capacity, max_guests_per_slot, 40)
where max_covers_per_slot is null;

alter table public.restaurant_settings
  alter column max_covers_per_slot set default 40;

alter table public.restaurant_settings
  alter column max_covers_per_slot set not null;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_max_covers_per_slot_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_max_covers_per_slot_check check (max_covers_per_slot > 0);

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_days_in_advance_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_days_in_advance_check check (days_in_advance >= 1 and days_in_advance <= 365);

-- ---------------------------------------------------------------------------
-- 3) Tables physiques
-- ---------------------------------------------------------------------------
create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  min_covers integer not null,
  max_covers integer not null,
  is_combinable boolean not null default false,
  created_at timestamptz not null default now(),
  constraint restaurant_tables_covers_check check (min_covers > 0 and max_covers >= min_covers)
);

create index if not exists restaurant_tables_restaurant_id_idx on public.restaurant_tables (restaurant_id);

alter table public.reservations
  add column if not exists table_id uuid references public.restaurant_tables(id) on delete set null;

create index if not exists reservations_table_id_idx on public.reservations (table_id);

create unique index if not exists reservations_one_active_booking_per_table_slot
on public.reservations (restaurant_id, table_id, reservation_date, reservation_time)
where table_id is not null and status in ('pending', 'confirmed');

-- ---------------------------------------------------------------------------
-- 4) Helpers temps
-- ---------------------------------------------------------------------------
create or replace function public.zengrow_time_to_minutes(t text)
returns integer
language sql
immutable
strict
as $$
  select (split_part(t, ':', 1)::integer * 60) + split_part(t, ':', 2)::integer;
$$;

create or replace function public.zengrow_minutes_to_time(m integer)
returns text
language sql
immutable
strict
as $$
  select lpad((m / 60)::text, 2, '0') || ':' || lpad((m % 60)::text, 2, '0');
$$;

-- ---------------------------------------------------------------------------
-- 5) Capacité / tables : trigger BEFORE INSERT OR UPDATE
-- ---------------------------------------------------------------------------
create or replace function public.zengrow_check_reservation_capacity()
returns trigger
language plpgsql
as $$
declare
  v_max_covers integer;
  v_max_party integer;
  v_slot_interval integer;
  v_use_tables boolean;
  v_used integer;
  v_time time;
  v_minutes integer;
begin
  if new.status not in ('pending', 'confirmed') then
    return new;
  end if;

  perform pg_advisory_xact_lock(
    hashtext(
      new.restaurant_id::text
      || '|'
      || new.reservation_date::text
      || '|'
      || new.reservation_time
    )
  );

  select
    coalesce(s.max_covers_per_slot, s.restaurant_capacity, 40),
    coalesce(s.max_party_size, 8),
    coalesce(s.reservation_slot_interval, 30),
    coalesce(s.use_tables, false)
  into v_max_covers, v_max_party, v_slot_interval, v_use_tables
  from public.restaurant_settings s
  where s.restaurant_id = new.restaurant_id;

  if v_max_covers is null then v_max_covers := 40; end if;
  if v_max_party is null then v_max_party := 8; end if;
  if v_slot_interval is null or v_slot_interval <= 0 then v_slot_interval := 30; end if;

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

  if v_use_tables then
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
        and r.reservation_time = new.reservation_time
        and r.status in ('pending', 'confirmed')
        and (tg_op = 'INSERT' or r.id <> new.id)
    ) then
      raise exception 'TABLE_TAKEN';
    end if;
  else
    new.table_id := null;

    select coalesce(sum(r.guests), 0)
    into v_used
    from public.reservations r
    where r.restaurant_id = new.restaurant_id
      and r.reservation_date = new.reservation_date
      and r.reservation_time = new.reservation_time
      and r.status in ('pending', 'confirmed')
      and (tg_op = 'INSERT' or r.id <> new.id);

    if (v_used + new.guests) > v_max_covers then
      raise exception 'SLOT_FULL';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists zengrow_check_capacity_overlap_trigger on public.reservations;
drop function if exists public.zengrow_check_capacity_overlap();

drop trigger if exists zengrow_check_reservation_capacity_trigger on public.reservations;
create trigger zengrow_check_reservation_capacity_trigger
before insert or update of reservation_date, reservation_time, guests, status, table_id, restaurant_id
on public.reservations
for each row
execute function public.zengrow_check_reservation_capacity();

-- ---------------------------------------------------------------------------
-- 6) Création publique atomique (verrouillage + insertion)
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
  p_source text
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
begin
  if p_status not in ('pending', 'confirmed') then
    raise exception 'INVALID_STATUS';
  end if;

  if p_guests is null or p_guests <= 0 then
    raise exception 'INVALID_GUESTS';
  end if;

  perform pg_advisory_xact_lock(
    hashtext(
      p_restaurant_id::text
      || '|'
      || p_reservation_date::text
      || '|'
      || left(trim(p_reservation_time), 5)
    )
  );

  select *
  into v_settings
  from public.restaurant_settings
  where restaurant_id = p_restaurant_id;

  if not found then
    raise exception 'SETTINGS_NOT_FOUND';
  end if;

  v_max_covers := coalesce(v_settings.max_covers_per_slot, v_settings.restaurant_capacity, 40);

  if coalesce(v_settings.use_tables, false) then
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
          and r.reservation_time = p_reservation_time
          and r.status in ('pending', 'confirmed')
      )
    order by t.max_covers asc, t.min_covers asc
    limit 1;

    if v_table_id is null then
      raise exception 'SLOT_FULL';
    end if;
  else
    v_table_id := null;

    select coalesce(sum(r.guests), 0)
    into v_used
    from public.reservations r
    where r.restaurant_id = p_restaurant_id
      and r.reservation_date = p_reservation_date
      and r.reservation_time = p_reservation_time
      and r.status in ('pending', 'confirmed');

    if (v_used + p_guests) > v_max_covers then
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
    table_id
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
    v_table_id
  )
  returning id, status into v_id, v_st;

  return jsonb_build_object('id', v_id, 'status', v_st);
end;
$$;

grant execute on function public.create_public_reservation(
  uuid, text, text, text, integer, date, text, text, text
) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7) Créneaux disponibles (lecture cohérente pour l’UI)
-- ---------------------------------------------------------------------------
create or replace function public.get_available_slots(
  p_restaurant_id uuid,
  p_date date,
  p_covers integer
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
  v_max_party integer;
  v_max_covers integer;
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
begin
  if p_covers is null or p_covers <= 0 then
    return '[]'::jsonb;
  end if;

  select
    rs.reservation_slot_interval,
    rs.max_party_size,
    rs.max_covers_per_slot,
    rs.restaurant_capacity,
    rs.use_tables,
    rs.days_in_advance,
    rs.opening_hours,
    rs.closure_start_date,
    rs.closure_end_date
  into s
  from public.restaurant_settings rs
  where rs.restaurant_id = p_restaurant_id;

  if not found then
    return '[]'::jsonb;
  end if;

  v_interval := coalesce(s.reservation_slot_interval, 30);
  v_max_party := coalesce(s.max_party_size, 8);
  v_max_covers := coalesce(s.max_covers_per_slot, s.restaurant_capacity, 40);
  v_use_tables := coalesce(s.use_tables, false);
  v_days := coalesce(s.days_in_advance, 60);
  v_oh := s.opening_hours;

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

        if v_use_tables then
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
                and r.reservation_time = v_slot
                and r.status in ('pending', 'confirmed')
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
        else
          select coalesce(sum(r.guests), 0)
          into v_used
          from public.reservations r
          where r.restaurant_id = p_restaurant_id
            and r.reservation_date = p_date
            and r.reservation_time = v_slot
            and r.status in ('pending', 'confirmed');

          if (v_used + p_covers) <= v_max_covers then
            v_elem := jsonb_build_object(
              'time', v_slot,
              'suggestedTableId', null,
              'remainingCapacity', greatest(v_max_covers - v_used - p_covers, 0)
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

grant execute on function public.get_available_slots(uuid, date, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 8) RLS restaurant_tables
-- ---------------------------------------------------------------------------
alter table public.restaurant_tables enable row level security;

drop policy if exists "restaurant_tables_owner_select" on public.restaurant_tables;
create policy "restaurant_tables_owner_select"
on public.restaurant_tables for select
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_tables.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "restaurant_tables_owner_insert" on public.restaurant_tables;
create policy "restaurant_tables_owner_insert"
on public.restaurant_tables for insert
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_tables.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "restaurant_tables_owner_update" on public.restaurant_tables;
create policy "restaurant_tables_owner_update"
on public.restaurant_tables for update
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_tables.restaurant_id and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_tables.restaurant_id and r.owner_id = auth.uid()
  )
);

drop policy if exists "restaurant_tables_owner_delete" on public.restaurant_tables;
create policy "restaurant_tables_owner_delete"
on public.restaurant_tables for delete
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_tables.restaurant_id and r.owner_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- 9) Plus d’insert anonyme direct sur reservations (passage par RPC atomique)
-- ---------------------------------------------------------------------------
drop policy if exists "reservations_public_insert_from_link" on public.reservations;
