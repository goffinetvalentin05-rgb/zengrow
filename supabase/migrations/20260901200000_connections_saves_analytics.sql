-- Connections + richer discovery analytics.
-- Additive only. Reuses saved_profiles, follows, discovery_events.
-- Does not drop/rename existing tables. Does not store visitor identity.

-- ---------------------------------------------------------------------------
-- Connections (new)
-- ---------------------------------------------------------------------------
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connections_no_self_chk check (requester_id <> receiver_id),
  constraint connections_status_chk check (status in ('pending', 'accepted', 'declined'))
);

create unique index if not exists connections_pair_uidx
  on public.connections (
    least(requester_id, receiver_id),
    greatest(requester_id, receiver_id)
  );

create index if not exists connections_receiver_status_idx
  on public.connections (receiver_id, status, created_at desc);

create index if not exists connections_requester_status_idx
  on public.connections (requester_id, status);

drop trigger if exists connections_set_updated_at on public.connections;
create trigger connections_set_updated_at
  before update on public.connections
  for each row execute function public.discovery_set_updated_at();

alter table public.connections enable row level security;

drop policy if exists connections_participants_read on public.connections;
create policy connections_participants_read on public.connections
  for select using (
    public.discovery_is_admin()
    or requester_id = public.discovery_my_profile_id()
    or receiver_id = public.discovery_my_profile_id()
  );

drop policy if exists connections_requester_insert on public.connections;
create policy connections_requester_insert on public.connections
  for insert with check (
    requester_id = public.discovery_my_profile_id()
    and requester_id <> receiver_id
    and status = 'pending'
  );

drop policy if exists connections_participants_update on public.connections;
create policy connections_participants_update on public.connections
  for update using (
    public.discovery_is_admin()
    or requester_id = public.discovery_my_profile_id()
    or receiver_id = public.discovery_my_profile_id()
  ) with check (
    public.discovery_is_admin()
    or requester_id = public.discovery_my_profile_id()
    or receiver_id = public.discovery_my_profile_id()
  );

drop policy if exists connections_requester_delete on public.connections;
create policy connections_requester_delete on public.connections
  for delete using (
    public.discovery_is_admin()
    or requester_id = public.discovery_my_profile_id()
  );

grant select, insert, update, delete on table public.connections to authenticated;
grant all on table public.connections to service_role;

-- ---------------------------------------------------------------------------
-- discovery_events: additive columns + broader event types
-- ---------------------------------------------------------------------------
alter table public.discovery_events
  add column if not exists visitor_key text,
  add column if not exists destination text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists referrer_host text;

alter table public.discovery_events
  drop constraint if exists discovery_events_type_chk;

alter table public.discovery_events
  add constraint discovery_events_type_chk
  check (event_type in (
    'profile_view',
    'external_link_click',
    'featured_content_click',
    'project_click',
    'follow',
    'search_result_click',
    'profile_save',
    'profile_impression',
    'profile_open_from_discovery',
    'profile_external_click'
  ));

alter table public.discovery_events
  drop constraint if exists discovery_events_source_chk;

alter table public.discovery_events
  add constraint discovery_events_source_chk
  check (source is null or source in (
    'explore', 'search', 'category', 'direct', 'following', 'saved',
    'instagram', 'youtube', 'tiktok', 'x', 'linkedin', 'website', 'other'
  ));

create index if not exists discovery_events_profile_visitor_idx
  on public.discovery_events (profile_id, event_type, visitor_key, created_at desc)
  where visitor_key is not null;

create index if not exists discovery_events_profile_utm_idx
  on public.discovery_events (profile_id, event_type, utm_source, created_at desc);

-- ---------------------------------------------------------------------------
-- Insert helper: server-side self-skip + short-window dedupe. Never stores
-- visitor profile ids — visitor_key is an opaque hash from the API.
-- ---------------------------------------------------------------------------
create or replace function public.discovery_track_event(
  p_profile_id uuid,
  p_event_type text,
  p_source text default null,
  p_platform text default null,
  p_content_id uuid default null,
  p_visitor_key text default null,
  p_destination text default null,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_referrer_host text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  my_id uuid;
  visitor_cat text;
  clean_source text;
  clean_type text;
  clean_platform text;
  clean_utm_source text;
  clean_utm_medium text;
  clean_referrer text;
  clean_destination text;
  clean_visitor text;
begin
  clean_type := nullif(trim(p_event_type), '');
  if clean_type is null or clean_type not in (
    'profile_view',
    'external_link_click',
    'featured_content_click',
    'project_click',
    'follow',
    'search_result_click',
    'profile_save',
    'profile_impression',
    'profile_open_from_discovery',
    'profile_external_click'
  ) then
    return jsonb_build_object('ok', false, 'error', 'invalid_event');
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = p_profile_id and p.is_public = true and p.is_disabled = false
  ) then
    return jsonb_build_object('ok', false, 'error', 'profile_not_found');
  end if;

  my_id := public.discovery_my_profile_id();
  if my_id is not null and my_id = p_profile_id and clean_type in (
    'profile_view', 'profile_impression', 'profile_open_from_discovery'
  ) then
    return jsonb_build_object('ok', true, 'skipped', 'self');
  end if;

  clean_source := lower(nullif(trim(p_source), ''));
  if clean_source is null or clean_source not in (
    'explore', 'search', 'category', 'direct', 'following', 'saved',
    'instagram', 'youtube', 'tiktok', 'x', 'linkedin', 'website', 'other'
  ) then
    clean_source := 'direct';
  end if;

  clean_platform := left(lower(nullif(trim(p_platform), '')), 40);
  clean_utm_source := left(lower(nullif(trim(p_utm_source), '')), 40);
  clean_utm_medium := left(lower(nullif(trim(p_utm_medium), '')), 40);
  clean_referrer := left(lower(nullif(trim(p_referrer_host), '')), 120);
  clean_destination := left(nullif(trim(p_destination), ''), 500);
  clean_visitor := left(nullif(trim(p_visitor_key), ''), 64);

  if my_id is not null then
    select c.slug into visitor_cat
    from public.profiles p
    left join public.categories c on c.id = p.primary_category_id
    where p.id = my_id;
  end if;

  if clean_type in ('profile_view', 'profile_impression') and clean_visitor is not null then
    if exists (
      select 1
      from public.discovery_events e
      where e.profile_id = p_profile_id
        and e.event_type = clean_type
        and e.visitor_key = clean_visitor
        and e.created_at >= now() - interval '30 minutes'
    ) then
      return jsonb_build_object('ok', true, 'skipped', 'deduped');
    end if;
  end if;

  insert into public.discovery_events (
    profile_id,
    event_type,
    source,
    platform,
    content_id,
    visitor_category_slug,
    visitor_key,
    destination,
    utm_source,
    utm_medium,
    referrer_host
  ) values (
    p_profile_id,
    clean_type,
    clean_source,
    clean_platform,
    p_content_id,
    visitor_cat,
    clean_visitor,
    clean_destination,
    clean_utm_source,
    clean_utm_medium,
    clean_referrer
  );

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.discovery_track_event(
  uuid, text, text, text, uuid, text, text, text, text, text
) from public;
grant execute on function public.discovery_track_event(
  uuid, text, text, text, uuid, text, text, text, text, text
) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Aggregated analytics (never returns visitor identity)
-- ---------------------------------------------------------------------------
create or replace function public.discovery_profile_analytics(
  p_profile_id uuid,
  p_range_days integer
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  allowed boolean;
  days integer;
  range_start timestamptz;
  prev_start timestamptz;
  today_start timestamptz;
  result jsonb;
  followers_now integer;
begin
  allowed := public.discovery_is_admin()
    or exists (
      select 1 from public.profiles p
      where p.id = p_profile_id and p.user_id = auth.uid()
    );

  if not allowed then
    raise exception 'Not allowed';
  end if;

  days := greatest(1, least(coalesce(p_range_days, 30), 90));
  range_start := now() - make_interval(days => days);
  prev_start := now() - make_interval(days => days * 2);
  today_start := date_trunc('day', now());

  select followers_count into followers_now
  from public.profiles
  where id = p_profile_id;

  select jsonb_build_object(
    'range_days', days,
    'views_total', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id and e.event_type = 'profile_view'
    ),
    'views', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id and e.event_type = 'profile_view' and e.created_at >= range_start
    ),
    'views_prev', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id and e.event_type = 'profile_view'
        and e.created_at >= prev_start and e.created_at < range_start
    ),
    'views_today', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id and e.event_type = 'profile_view' and e.created_at >= today_start
    ),
    'views_7d', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id and e.event_type = 'profile_view' and e.created_at >= now() - interval '7 days'
    ),
    'views_30d', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id and e.event_type = 'profile_view' and e.created_at >= now() - interval '30 days'
    ),
    'unique_visitors', (
      select coalesce(count(distinct e.visitor_key), 0)
      from public.discovery_events e
      where e.profile_id = p_profile_id
        and e.event_type = 'profile_view'
        and e.created_at >= range_start
        and e.visitor_key is not null
    ) + (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id
        and e.event_type = 'profile_view'
        and e.created_at >= range_start
        and e.visitor_key is null
    ),
    'unique_visitors_prev', (
      select coalesce(count(distinct e.visitor_key), 0)
      from public.discovery_events e
      where e.profile_id = p_profile_id
        and e.event_type = 'profile_view'
        and e.created_at >= prev_start and e.created_at < range_start
        and e.visitor_key is not null
    ) + (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id
        and e.event_type = 'profile_view'
        and e.created_at >= prev_start and e.created_at < range_start
        and e.visitor_key is null
    ),
    'external_clicks', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id
        and e.event_type in ('external_link_click', 'featured_content_click', 'project_click', 'profile_external_click')
        and e.created_at >= range_start
    ),
    'external_clicks_prev', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id
        and e.event_type in ('external_link_click', 'featured_content_click', 'project_click', 'profile_external_click')
        and e.created_at >= prev_start and e.created_at < range_start
    ),
    'external_clicks_total', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id
        and e.event_type in ('external_link_click', 'featured_content_click', 'project_click', 'profile_external_click')
    ),
    'impressions', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id
        and e.event_type = 'profile_impression'
        and e.created_at >= range_start
    ),
    'profile_opens', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id
        and e.event_type in ('profile_open_from_discovery', 'search_result_click')
        and e.created_at >= range_start
    ),
    'follows', (
      select count(*) from public.discovery_events e
      where e.profile_id = p_profile_id and e.event_type = 'follow' and e.created_at >= range_start
    ),
    'clicks_by_platform', coalesce((
      select jsonb_object_agg(platform, n)
      from (
        select coalesce(nullif(e.platform, ''), 'other') as platform, count(*) as n
        from public.discovery_events e
        where e.profile_id = p_profile_id
          and e.event_type in ('external_link_click', 'featured_content_click', 'project_click', 'profile_external_click')
          and e.created_at >= range_start
        group by 1
      ) s
    ), '{}'::jsonb),
    'sources', coalesce((
      select jsonb_object_agg(source, n)
      from (
        select coalesce(e.source, 'direct') as source, count(*) as n
        from public.discovery_events e
        where e.profile_id = p_profile_id
          and e.event_type = 'profile_view'
          and e.created_at >= range_start
        group by 1
      ) s
    ), '{}'::jsonb),
    'traffic_sources', coalesce((
      select jsonb_agg(jsonb_build_object('key', key, 'count', n) order by n desc)
      from (
        select
          case
            when e.utm_source in ('instagram', 'youtube', 'tiktok', 'x', 'linkedin')
              and coalesce(e.utm_medium, '') in ('bio', 'profile', 'link')
              then e.utm_source || '_bio'
            when e.utm_source in ('instagram', 'youtube', 'tiktok', 'x', 'linkedin', 'website')
              then e.utm_source
            when e.source = 'explore' then 'explore'
            when e.source = 'search' then 'search'
            when e.source = 'category' then 'category'
            when e.source in ('following', 'saved') then e.source
            when e.platform in ('instagram', 'youtube', 'tiktok', 'x', 'linkedin', 'website')
              then e.platform
            when e.utm_source is not null then e.utm_source
            when e.referrer_host is not null then 'other'
            else 'direct'
          end as key,
          count(*) as n
        from public.discovery_events e
        where e.profile_id = p_profile_id
          and e.event_type = 'profile_view'
          and e.created_at >= range_start
        group by 1
      ) s
    ), '[]'::jsonb),
    'visitor_niches', coalesce((
      select jsonb_agg(jsonb_build_object(
        'slug', s.slug,
        'name', coalesce(c.name, s.slug),
        'share', s.share,
        'count', s.n
      ) order by s.share desc)
      from (
        select e.visitor_category_slug as slug,
          count(*) as n,
          round(100.0 * count(*) / nullif(sum(count(*)) over (), 0), 0) as share
        from public.discovery_events e
        where e.profile_id = p_profile_id
          and e.event_type = 'profile_view'
          and e.created_at >= range_start
          and e.visitor_category_slug is not null
        group by e.visitor_category_slug
      ) s
      left join public.categories c on c.slug = s.slug
    ), '[]'::jsonb),
    'new_followers_7d', (
      select count(*) from public.follows f
      where f.following_id = p_profile_id and f.created_at >= now() - interval '7 days'
    ),
    'new_followers_30d', (
      select count(*) from public.follows f
      where f.following_id = p_profile_id and f.created_at >= now() - interval '30 days'
    ),
    'new_followers', (
      select count(*) from public.follows f
      where f.following_id = p_profile_id and f.created_at >= range_start
    ),
    'followers_total', coalesce(followers_now, 0),
    'views_over_time', coalesce((
      select jsonb_agg(jsonb_build_object('date', series.d::date, 'views', coalesce(v.n, 0)) order by series.d)
      from generate_series(range_start::date, now()::date, interval '1 day') as series(d)
      left join (
        select created_at::date as day, count(*) as n
        from public.discovery_events e
        where e.profile_id = p_profile_id
          and e.event_type = 'profile_view'
          and e.created_at >= range_start
        group by 1
      ) v on v.day = series.d::date
    ), '[]'::jsonb),
    'followers_over_time', coalesce((
      select jsonb_agg(jsonb_build_object('date', series.d::date, 'count', coalesce(v.n, 0)) order by series.d)
      from generate_series(range_start::date, now()::date, interval '1 day') as series(d)
      left join (
        select created_at::date as day, count(*) as n
        from public.follows f
        where f.following_id = p_profile_id
          and f.created_at >= range_start
        group by 1
      ) v on v.day = series.d::date
    ), '[]'::jsonb),
    'top_links', coalesce((
      select jsonb_agg(jsonb_build_object(
        'label', label,
        'platform', platform,
        'kind', kind,
        'clicks', n
      ) order by n desc)
      from (
        select
          coalesce(
            nullif(fc.title, ''),
            nullif(pr.name, ''),
            nullif(e.destination, ''),
            coalesce(nullif(e.platform, ''), 'other')
          ) as label,
          coalesce(nullif(e.platform, ''), 'other') as platform,
          case
            when e.event_type = 'featured_content_click' then 'featured'
            when e.event_type = 'project_click' then 'project'
            else 'link'
          end as kind,
          count(*) as n
        from public.discovery_events e
        left join public.featured_content fc on fc.id = e.content_id
        left join public.projects pr on pr.id = e.content_id
        where e.profile_id = p_profile_id
          and e.event_type in ('external_link_click', 'featured_content_click', 'project_click', 'profile_external_click')
          and e.created_at >= range_start
        group by 1, 2, 3
        order by n desc
        limit 8
      ) s
    ), '[]'::jsonb),
    'most_clicked_content', coalesce((
      select jsonb_agg(jsonb_build_object('content_id', content_id, 'clicks', n) order by n desc)
      from (
        select e.content_id, count(*) as n
        from public.discovery_events e
        where e.profile_id = p_profile_id
          and e.event_type = 'featured_content_click'
          and e.content_id is not null
          and e.created_at >= range_start
        group by e.content_id
        order by n desc
        limit 5
      ) s
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

create or replace function public.discovery_profile_analytics(p_profile_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return public.discovery_profile_analytics(p_profile_id, 30);
end;
$$;

revoke all on function public.discovery_profile_analytics(uuid) from public;
revoke all on function public.discovery_profile_analytics(uuid, integer) from public;
grant execute on function public.discovery_profile_analytics(uuid) to authenticated;
grant execute on function public.discovery_profile_analytics(uuid, integer) to authenticated;
