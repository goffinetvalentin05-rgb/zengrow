create or replace function public.zengrow_check_capacity_overlap()
returns trigger
language plpgsql
as $$
declare
  v_capacity integer;
  v_max_party integer;
  v_slot_interval integer;
  v_used integer;
  v_time time;
  v_minutes integer;
begin
  select
    coalesce(restaurant_capacity, 40),
    coalesce(max_party_size, 8),
    coalesce(reservation_slot_interval, 30)
  into
    v_capacity,
    v_max_party,
    v_slot_interval
  from public.restaurant_settings
  where restaurant_id = new.restaurant_id;

  if v_capacity is null then v_capacity := 40; end if;
  if v_max_party is null then v_max_party := 8; end if;
  if v_slot_interval is null or v_slot_interval <= 0 then v_slot_interval := 30; end if;

  if new.guests > v_max_party then
    raise exception 'max party size is %', v_max_party;
  end if;

  if new.reservation_time !~ '^\d{2}:\d{2}$' then
    raise exception 'invalid slot interval';
  end if;

  v_time := new.reservation_time::time;
  v_minutes := extract(hour from v_time)::integer * 60 + extract(minute from v_time)::integer;
  if mod(v_minutes, v_slot_interval) <> 0 then
    raise exception 'invalid slot interval';
  end if;

  select coalesce(sum(r.guests), 0)
  into v_used
  from public.reservations r
  where r.restaurant_id = new.restaurant_id
    and r.reservation_date = new.reservation_date
    and r.reservation_time = new.reservation_time
    and r.status in ('pending', 'confirmed')
    and (tg_op = 'INSERT' or r.id <> new.id);

  if (v_used + new.guests) > v_capacity then
    raise exception 'slot is full';
  end if;

  return new;
end;
$$;
