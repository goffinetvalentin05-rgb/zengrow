-- Sharpz Analytics : site key + événements de trafic.

create table if not exists public.analytics_sites (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null unique references public.restaurants (id) on delete cascade,
  site_key text not null unique,
  first_event_at timestamptz,
  last_event_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  site_key text not null,
  session_id text not null,
  visitor_id text not null,
  event_type text not null default 'pageview',
  path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  device_type text,
  created_at timestamptz not null default now(),
  constraint analytics_events_event_type_chk
    check (event_type in ('pageview', 'custom'))
);

create index if not exists analytics_events_restaurant_created_idx
  on public.analytics_events (restaurant_id, created_at desc);

create index if not exists analytics_events_restaurant_path_idx
  on public.analytics_events (restaurant_id, path)
  where path is not null;

create index if not exists analytics_sites_site_key_idx
  on public.analytics_sites (site_key);

alter table public.analytics_sites enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists analytics_sites_owner_select on public.analytics_sites;
drop policy if exists analytics_sites_owner_insert on public.analytics_sites;
drop policy if exists analytics_sites_owner_update on public.analytics_sites;
create policy analytics_sites_owner_select on public.analytics_sites for select using (exists (select 1 from public.restaurants r where r.id = analytics_sites.restaurant_id and r.owner_id = auth.uid()));
create policy analytics_sites_owner_insert on public.analytics_sites for insert with check (exists (select 1 from public.restaurants r where r.id = analytics_sites.restaurant_id and r.owner_id = auth.uid()));
create policy analytics_sites_owner_update on public.analytics_sites for update using (exists (select 1 from public.restaurants r where r.id = analytics_sites.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = analytics_sites.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists analytics_events_owner_select on public.analytics_events;
create policy analytics_events_owner_select on public.analytics_events for select using (exists (select 1 from public.restaurants r where r.id = analytics_events.restaurant_id and r.owner_id = auth.uid()));

-- Agrégats trafic (lecture dashboard).
create or replace function public.sharpz_analytics_traffic_summary(p_restaurant_id uuid)
returns jsonb
language sql
stable
as $$
  with base as (
    select *
    from public.analytics_events
    where restaurant_id = p_restaurant_id
  ),
  today as (
    select count(distinct visitor_id) as visitors
    from base
    where created_at >= date_trunc('day', now())
  ),
  d7 as (
    select
      count(distinct visitor_id) filter (where created_at >= now() - interval '7 days') as visitors,
      count(distinct session_id) filter (where created_at >= now() - interval '7 days') as sessions,
      count(*) filter (where event_type = 'pageview' and created_at >= now() - interval '7 days') as pageviews
    from base
  ),
  d30 as (
    select count(distinct visitor_id) as visitors
    from base
    where created_at >= now() - interval '30 days'
  ),
  top_pages as (
    select coalesce(path, '/') as label, count(*) as count
    from base
    where event_type = 'pageview' and created_at >= now() - interval '7 days'
    group by 1
    order by count desc
    limit 8
  ),
  top_referrers as (
    select coalesce(nullif(referrer, ''), '(direct)') as label, count(*) as count
    from base
    where created_at >= now() - interval '7 days'
    group by 1
    order by count desc
    limit 8
  ),
  top_sources as (
    select coalesce(nullif(utm_source, ''), '(none)') as label, count(*) as count
    from base
    where created_at >= now() - interval '7 days'
    group by 1
    order by count desc
    limit 8
  ),
  devices as (
    select coalesce(device_type, 'unknown') as label, count(distinct session_id) as count
    from base
    where created_at >= now() - interval '7 days'
    group by 1
    order by count desc
    limit 5
  ),
  countries as (
    select coalesce(country, 'unknown') as label, count(distinct visitor_id) as count
    from base
    where created_at >= now() - interval '7 days'
    group by 1
    order by count desc
    limit 8
  ),
  last_evt as (
    select max(created_at) as last_event_at from base
  )
  select jsonb_build_object(
    'visitorsToday', (select visitors from today),
    'visitors7d', (select visitors from d7),
    'sessions7d', (select sessions from d7),
    'pageviews7d', (select pageviews from d7),
    'visitors30d', (select visitors from d30),
    'topPages', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count)) from top_pages), '[]'::jsonb),
    'topReferrers', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count)) from top_referrers), '[]'::jsonb),
    'topSources', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count)) from top_sources), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count)) from devices), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count)) from countries), '[]'::jsonb),
    'lastEventAt', (select last_event_at from last_evt)
  );
$$;
