-- Fenêtre visiteurs pour corrélations action → trafic (Résultats).

create or replace function public.sharpz_analytics_distinct_visitors(
  p_restaurant_id uuid,
  p_from timestamptz,
  p_to timestamptz
)
returns integer
language sql
stable
as $$
  select coalesce(count(distinct visitor_id)::integer, 0)
  from public.analytics_events
  where restaurant_id = p_restaurant_id
    and created_at >= p_from
    and created_at < p_to;
$$;
