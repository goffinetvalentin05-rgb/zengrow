-- Correctif : zengrow_can_book_slot appelait zengrow_overlap_used_at_slot sans p_lunch_e
-- (décalage des arguments → fonction introuvable côté client sur get_available_slots).

create or replace function public.zengrow_can_book_slot(
  p_restaurant_id uuid,
  p_date date,
  p_slot_time text,
  p_zone text,
  p_covers integer,
  p_mode text,
  p_terrace_capacity integer,
  p_lunch_max_covers integer,
  p_dinner_max_covers integer,
  p_time_slots_lunch_max integer,
  p_time_slots_dinner_max integer,
  p_lunch_duration integer,
  p_dinner_duration integer,
  p_lunch_en boolean,
  p_lunch_s time,
  p_lunch_e time,
  p_din_en boolean,
  p_din_s time,
  p_din_e time,
  p_exclude_id uuid default null
)
returns boolean
language plpgsql
stable
as $$
declare
  v_bucket text;
  v_cap integer;
  v_used integer;
  v_slot_duration integer;
begin
  v_bucket := public.zengrow_ss_service_bucket(
    p_slot_time,
    p_lunch_en,
    p_lunch_s,
    p_lunch_e,
    p_din_en,
    p_din_s,
    p_din_e
  );

  if v_bucket is null then
    return false;
  end if;

  v_slot_duration := case
    when v_bucket = 'lunch' then greatest(coalesce(p_lunch_duration, 90), 1)
    else greatest(coalesce(p_dinner_duration, 120), 1)
  end;

  if coalesce(p_mode, 'global_covers') = 'time_slots' then
    v_cap := case
      when p_zone = 'terrace' then coalesce(p_terrace_capacity, 0)
      when v_bucket = 'lunch' then coalesce(p_time_slots_lunch_max, 0)
      else coalesce(p_time_slots_dinner_max, 0)
    end;
    v_used := public.zengrow_overlap_used_at_slot(
      p_restaurant_id,
      p_date,
      p_slot_time,
      v_slot_duration,
      p_zone,
      true,
      p_lunch_en,
      p_lunch_s,
      p_lunch_e,
      p_lunch_duration,
      p_din_en,
      p_din_s,
      p_din_e,
      p_dinner_duration,
      p_exclude_id
    );
    return v_cap > 0 and (v_used + 1) <= v_cap;
  end if;

  v_cap := case
    when p_zone = 'terrace' then coalesce(p_terrace_capacity, 0)
    when v_bucket = 'lunch' then coalesce(p_lunch_max_covers, 0)
    else coalesce(p_dinner_max_covers, 0)
  end;

  v_used := public.zengrow_overlap_used_at_slot(
    p_restaurant_id,
    p_date,
    p_slot_time,
    v_slot_duration,
    p_zone,
    false,
    p_lunch_en,
    p_lunch_s,
    p_lunch_e,
    p_lunch_duration,
    p_din_en,
    p_din_s,
    p_din_e,
    p_dinner_duration,
    p_exclude_id
  );

  return v_cap > 0 and (v_used + greatest(p_covers, 0)) <= v_cap;
end;
$$;
