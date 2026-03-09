-- 1) Smart capacity settings
alter table public.restaurant_settings
  add column if not exists restaurant_capacity integer not null default 40,
  add column if not exists max_party_size integer not null default 8;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_capacity_check;
alter table public.restaurant_settings
  add constraint restaurant_settings_capacity_check check (restaurant_capacity > 0);

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_max_party_check;
alter table public.restaurant_settings
  add constraint restaurant_settings_max_party_check check (max_party_size > 0);

-- 2) Pending by default + strict public insert policy
alter table public.reservations
  drop constraint if exists reservations_status_check;
alter table public.reservations
  add constraint reservations_status_check
  check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no-show'));

alter table public.reservations
  alter column status set default 'pending';

drop policy if exists "reservations_public_insert_from_link" on public.reservations;
create policy "reservations_public_insert_from_link"
on public.reservations for insert
with check (
  source = 'public_link'
  and status = 'pending'
  and exists (
    select 1
    from public.restaurants r
    where r.id = reservations.restaurant_id
  )
);

-- 3) Replace old capacity trigger by overlap-aware capacity trigger
drop trigger if exists zengrow_check_slot_capacity_trigger on public.reservations;
drop function if exists public.zengrow_check_slot_capacity();

create or replace function public.zengrow_check_capacity_overlap()
returns trigger
language plpgsql
as $$
declare
  v_capacity integer;
  v_duration integer;
  v_max_party integer;
  v_new_start timestamp;
  v_new_end timestamp;
  v_used integer;
begin
  select
    coalesce(restaurant_capacity, 40),
    coalesce(reservation_duration, 90),
    coalesce(max_party_size, 8)
  into
    v_capacity,
    v_duration,
    v_max_party
  from public.restaurant_settings
  where restaurant_id = new.restaurant_id;

  if v_capacity is null then v_capacity := 40; end if;
  if v_duration is null then v_duration := 90; end if;
  if v_max_party is null then v_max_party := 8; end if;

  if new.guests > v_max_party then
    raise exception 'Reservation exceeds max party size (%).', v_max_party;
  end if;

  v_new_start := (new.reservation_date::text || ' ' || new.reservation_time)::timestamp;
  v_new_end := v_new_start + make_interval(mins => v_duration);

  select coalesce(sum(r.guests), 0)
  into v_used
  from public.reservations r
  where r.restaurant_id = new.restaurant_id
    and r.reservation_date = new.reservation_date
    and r.status in ('pending', 'confirmed')
    and (tg_op = 'INSERT' or r.id <> new.id)
    and ((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) < v_new_end
    and (((r.reservation_date::text || ' ' || r.reservation_time)::timestamp) + make_interval(mins => v_duration)) > v_new_start;

  if (v_used + new.guests) > v_capacity then
    raise exception 'Capacity exceeded for this time window.';
  end if;

  return new;
end;
$$;

drop trigger if exists zengrow_check_capacity_overlap_trigger on public.reservations;
create trigger zengrow_check_capacity_overlap_trigger
before insert or update of reservation_date, reservation_time, guests, status
on public.reservations
for each row
when (new.status in ('pending', 'confirmed'))
execute function public.zengrow_check_capacity_overlap();

create index if not exists reservations_capacity_lookup_idx
on public.reservations (restaurant_id, reservation_date, status, reservation_time);

-- 4) Persistent customers table
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  reservation_count integer not null default 0,
  total_visits integer not null default 0,
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_restaurant_id_idx on public.customers (restaurant_id);
create index if not exists customers_email_idx on public.customers (restaurant_id, lower(email));
create index if not exists customers_phone_idx on public.customers (restaurant_id, phone);

create unique index if not exists customers_unique_email_per_restaurant
on public.customers (restaurant_id, lower(email))
where email is not null;

create unique index if not exists customers_unique_phone_per_restaurant
on public.customers (restaurant_id, phone)
where phone is not null;

alter table public.customers enable row level security;

drop policy if exists "customers_owner_select" on public.customers;
create policy "customers_owner_select"
on public.customers for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = customers.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "customers_owner_insert" on public.customers;
create policy "customers_owner_insert"
on public.customers for insert
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = customers.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "customers_owner_update" on public.customers;
create policy "customers_owner_update"
on public.customers for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = customers.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = customers.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "customers_owner_delete" on public.customers;
create policy "customers_owner_delete"
on public.customers for delete
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = customers.restaurant_id
      and r.owner_id = auth.uid()
  )
);

alter table public.reservations
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists reservations_customer_id_idx on public.reservations (customer_id);

create or replace function public.zengrow_refresh_customer_metrics(p_customer_id uuid)
returns void
language plpgsql
as $$
begin
  if p_customer_id is null then
    return;
  end if;

  update public.customers c
  set
    reservation_count = agg.reservation_count,
    total_visits = agg.total_visits,
    last_visit_at = agg.last_visit_at,
    updated_at = now()
  from (
    select
      count(*)::integer as reservation_count,
      count(*) filter (where status = 'completed')::integer as total_visits,
      max(
        case
          when status = 'completed'
          then ((reservation_date::text || ' ' || reservation_time)::timestamp)::timestamptz
          else null
        end
      ) as last_visit_at
    from public.reservations
    where customer_id = p_customer_id
  ) agg
  where c.id = p_customer_id;
end;
$$;

create or replace function public.zengrow_resolve_customer(
  p_restaurant_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text
)
returns uuid
language plpgsql
as $$
declare
  v_customer_id uuid;
begin
  if p_guest_email is not null and length(trim(p_guest_email)) > 0 then
    select id
    into v_customer_id
    from public.customers
    where restaurant_id = p_restaurant_id
      and lower(email) = lower(trim(p_guest_email))
    limit 1;
  end if;

  if v_customer_id is null and p_guest_phone is not null and length(trim(p_guest_phone)) > 0 then
    select id
    into v_customer_id
    from public.customers
    where restaurant_id = p_restaurant_id
      and phone = trim(p_guest_phone)
    limit 1;
  end if;

  if v_customer_id is null then
    insert into public.customers (restaurant_id, full_name, email, phone)
    values (
      p_restaurant_id,
      coalesce(nullif(trim(p_guest_name), ''), 'Client'),
      nullif(trim(p_guest_email), ''),
      nullif(trim(p_guest_phone), '')
    )
    returning id into v_customer_id;
  else
    update public.customers
    set
      full_name = coalesce(nullif(trim(p_guest_name), ''), full_name),
      email = coalesce(nullif(trim(p_guest_email), ''), email),
      phone = coalesce(nullif(trim(p_guest_phone), ''), phone),
      updated_at = now()
    where id = v_customer_id;
  end if;

  return v_customer_id;
end;
$$;

create or replace function public.zengrow_attach_customer_to_reservation()
returns trigger
language plpgsql
as $$
begin
  new.customer_id := public.zengrow_resolve_customer(
    new.restaurant_id,
    new.guest_name,
    new.guest_email,
    new.guest_phone
  );
  return new;
end;
$$;

drop trigger if exists zengrow_attach_customer_trigger on public.reservations;
create trigger zengrow_attach_customer_trigger
before insert or update of guest_name, guest_email, guest_phone, restaurant_id
on public.reservations
for each row
execute function public.zengrow_attach_customer_to_reservation();

create or replace function public.zengrow_refresh_customer_metrics_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform public.zengrow_refresh_customer_metrics(new.customer_id);
    return new;
  elsif tg_op = 'UPDATE' then
    perform public.zengrow_refresh_customer_metrics(old.customer_id);
    perform public.zengrow_refresh_customer_metrics(new.customer_id);
    return new;
  elsif tg_op = 'DELETE' then
    perform public.zengrow_refresh_customer_metrics(old.customer_id);
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists zengrow_refresh_customer_metrics_trigger on public.reservations;
create trigger zengrow_refresh_customer_metrics_trigger
after insert or update or delete
on public.reservations
for each row
execute function public.zengrow_refresh_customer_metrics_trigger();

-- Backfill existing reservations -> customers
update public.reservations r
set customer_id = public.zengrow_resolve_customer(
  r.restaurant_id,
  r.guest_name,
  r.guest_email,
  r.guest_phone
)
where r.customer_id is null;

update public.customers c
set
  reservation_count = agg.reservation_count,
  total_visits = agg.total_visits,
  last_visit_at = agg.last_visit_at,
  updated_at = now()
from (
  select
    customer_id,
    count(*)::integer as reservation_count,
    count(*) filter (where status = 'completed')::integer as total_visits,
    max(
      case
        when status = 'completed'
        then ((reservation_date::text || ' ' || reservation_time)::timestamp)::timestamptz
        else null
      end
    ) as last_visit_at
  from public.reservations
  where customer_id is not null
  group by customer_id
) agg
where c.id = agg.customer_id;
