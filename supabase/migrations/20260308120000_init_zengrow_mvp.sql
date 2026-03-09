create extension if not exists pgcrypto;

drop table if exists public.review_requests cascade;
drop table if exists public.blocked_slots cascade;
drop table if exists public.reservations cascade;
drop table if exists public.restaurant_settings cascade;
drop table if exists public.restaurants cascade;

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  phone text,
  email text,
  address text,
  description text,
  created_at timestamptz default now(),
  constraint restaurants_owner_id_unique unique (owner_id)
);

create table public.restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  opening_hours jsonb,
  max_guests_per_slot integer default 20,
  reservation_slot_interval integer default 30,
  reservation_duration integer default 90,
  allow_phone boolean default true,
  allow_email boolean default true,
  created_at timestamptz default now(),
  constraint restaurant_settings_restaurant_id_unique unique (restaurant_id),
  constraint restaurant_settings_max_guests_check check (max_guests_per_slot > 0),
  constraint restaurant_settings_slot_interval_check check (reservation_slot_interval > 0),
  constraint restaurant_settings_duration_check check (reservation_duration > 0)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  guest_name text not null,
  guest_email text,
  guest_phone text,
  guests integer not null,
  reservation_date date not null,
  reservation_time text not null,
  status text not null default 'confirmed',
  source text default 'public_link',
  internal_note text,
  created_at timestamptz default now(),
  constraint reservations_guests_check check (guests > 0),
  constraint reservations_status_check check (status in ('confirmed', 'cancelled', 'completed'))
);

create table public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  reservation_date date not null,
  reservation_time text not null,
  reason text,
  created_at timestamptz default now(),
  constraint blocked_slots_unique unique (restaurant_id, reservation_date, reservation_time)
);

create table public.review_requests (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  reservation_id uuid references public.reservations(id) on delete cascade,
  status text default 'pending',
  sent_at timestamptz,
  created_at timestamptz default now(),
  constraint review_requests_status_check check (status in ('pending', 'sent', 'failed')),
  constraint review_requests_reservation_unique unique (reservation_id)
);

create index restaurants_owner_id_idx on public.restaurants (owner_id);
create index restaurants_slug_idx on public.restaurants (slug);
create index reservations_restaurant_id_idx on public.reservations (restaurant_id);
create index reservations_date_time_idx on public.reservations (reservation_date, reservation_time);
create index reservations_status_idx on public.reservations (status);
create index blocked_slots_restaurant_date_idx on public.blocked_slots (restaurant_id, reservation_date);
create index review_requests_restaurant_status_idx on public.review_requests (restaurant_id, status);

create or replace function public.zengrow_default_opening_hours()
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'mon', jsonb_build_array(jsonb_build_object('start', '11:30', 'end', '14:30'), jsonb_build_object('start', '18:00', 'end', '22:00')),
    'tue', jsonb_build_array(jsonb_build_object('start', '11:30', 'end', '14:30'), jsonb_build_object('start', '18:00', 'end', '22:00')),
    'wed', jsonb_build_array(jsonb_build_object('start', '11:30', 'end', '14:30'), jsonb_build_object('start', '18:00', 'end', '22:00')),
    'thu', jsonb_build_array(jsonb_build_object('start', '11:30', 'end', '14:30'), jsonb_build_object('start', '18:00', 'end', '22:00')),
    'fri', jsonb_build_array(jsonb_build_object('start', '11:30', 'end', '14:30'), jsonb_build_object('start', '18:00', 'end', '22:30')),
    'sat', jsonb_build_array(jsonb_build_object('start', '11:30', 'end', '15:00'), jsonb_build_object('start', '18:00', 'end', '22:30')),
    'sun', jsonb_build_array()
  );
$$;

create or replace function public.zengrow_check_slot_capacity()
returns trigger
language plpgsql
as $$
declare
  capacity integer;
  current_total integer;
begin
  select max_guests_per_slot
  into capacity
  from public.restaurant_settings
  where restaurant_id = new.restaurant_id;

  if capacity is null then
    capacity := 20;
  end if;

  select coalesce(sum(guests), 0)
  into current_total
  from public.reservations
  where restaurant_id = new.restaurant_id
    and reservation_date = new.reservation_date
    and reservation_time = new.reservation_time
    and status = 'confirmed';

  if (current_total + new.guests) > capacity then
    raise exception 'This time slot is full.';
  end if;

  return new;
end;
$$;

create trigger zengrow_check_slot_capacity_trigger
before insert on public.reservations
for each row execute function public.zengrow_check_slot_capacity();

create or replace function public.zengrow_create_review_request_on_completed()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed'
     and old.status is distinct from 'completed' then
    insert into public.review_requests (restaurant_id, reservation_id, status)
    values (new.restaurant_id, new.id, 'pending')
    on conflict (reservation_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger zengrow_create_review_request_trigger
after update on public.reservations
for each row execute function public.zengrow_create_review_request_on_completed();

alter table public.restaurants enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.reservations enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.review_requests enable row level security;

create policy "restaurants_owner_select"
on public.restaurants for select
using (owner_id = auth.uid());

create policy "restaurants_owner_insert"
on public.restaurants for insert
with check (owner_id = auth.uid());

create policy "restaurants_owner_update"
on public.restaurants for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "restaurants_owner_delete"
on public.restaurants for delete
using (owner_id = auth.uid());

create policy "restaurants_public_select_for_booking"
on public.restaurants for select
using (true);

create policy "restaurant_settings_owner_select"
on public.restaurant_settings for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_settings.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "restaurant_settings_owner_insert"
on public.restaurant_settings for insert
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_settings.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "restaurant_settings_owner_update"
on public.restaurant_settings for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_settings.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_settings.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "restaurant_settings_public_select"
on public.restaurant_settings for select
using (true);

create policy "reservations_owner_select"
on public.reservations for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = reservations.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "reservations_owner_update"
on public.reservations for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = reservations.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = reservations.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "reservations_owner_delete"
on public.reservations for delete
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = reservations.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "reservations_owner_insert"
on public.reservations for insert
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = reservations.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "reservations_public_insert_from_link"
on public.reservations for insert
with check (
  source = 'public_link'
  and status = 'confirmed'
  and exists (
    select 1 from public.restaurants r where r.id = reservations.restaurant_id
  )
);

create policy "blocked_slots_owner_select"
on public.blocked_slots for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = blocked_slots.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "blocked_slots_owner_insert"
on public.blocked_slots for insert
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = blocked_slots.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "blocked_slots_owner_update"
on public.blocked_slots for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = blocked_slots.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = blocked_slots.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "blocked_slots_owner_delete"
on public.blocked_slots for delete
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = blocked_slots.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "blocked_slots_public_select"
on public.blocked_slots for select
using (true);

create policy "review_requests_owner_select"
on public.review_requests for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = review_requests.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "review_requests_owner_insert"
on public.review_requests for insert
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = review_requests.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "review_requests_owner_update"
on public.review_requests for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = review_requests.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = review_requests.restaurant_id
      and r.owner_id = auth.uid()
  )
);
