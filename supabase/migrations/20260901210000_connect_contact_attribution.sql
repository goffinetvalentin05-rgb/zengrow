-- Connect contact tracking + explicit Sharpz traffic attribution.
-- Additive. Reuses discovery_events, connections, social_links.
-- Does not drop/rename tables.

alter table public.discovery_events
  add column if not exists utm_campaign text;

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
    'profile_external_click',
    'connection_contact_click'
  ));

alter table public.discovery_events
  drop constraint if exists discovery_events_source_chk;

alter table public.discovery_events
  add constraint discovery_events_source_chk
  check (source is null or source in (
    'explore', 'search', 'category', 'direct', 'following', 'saved',
    'sharpz_explore', 'sharpz_search', 'sharpz_category',
    'sharpz_following', 'sharpz_saved', 'sharpz_recommendation',
    'instagram', 'youtube', 'tiktok', 'x', 'linkedin', 'website', 'other'
  ));

create or replace function public.discovery_classify_traffic_source(
  p_source text,
  p_utm_source text,
  p_referrer_host text,
  p_platform text default null
)
returns text
language sql
immutable
as $$
  select case
    when lower(coalesce(p_source, '')) in ('explore', 'sharpz_explore') then 'sharpz_explore'
    when lower(coalesce(p_source, '')) in ('search', 'sharpz_search') then 'sharpz_search'
    when lower(coalesce(p_source, '')) in ('category', 'sharpz_category') then 'sharpz_category'
    when lower(coalesce(p_source, '')) in ('following', 'sharpz_following') then 'sharpz_following'
    when lower(coalesce(p_source, '')) in ('saved', 'sharpz_saved') then 'sharpz_saved'
    when lower(coalesce(p_source, '')) in ('recommendation', 'sharpz_recommendation') then 'sharpz_recommendation'
    when lower(coalesce(p_utm_source, '')) in ('instagram', 'tiktok', 'youtube', 'linkedin', 'x')
      then lower(p_utm_source)
    when nullif(trim(p_utm_source), '') is not null then 'other'
    when lower(coalesce(p_referrer_host, '')) ~ '(^|[.])instagram[.]com$' then 'instagram'
    when lower(coalesce(p_referrer_host, '')) ~ '(^|[.])instagr[.]am$' then 'instagram'
    when lower(coalesce(p_referrer_host, '')) ~ '(^|[.])tiktok[.]com$' then 'tiktok'
    when lower(coalesce(p_referrer_host, '')) ~ '(^|[.])youtube[.]com$' then 'youtube'
    when lower(coalesce(p_referrer_host, '')) ~ '(^|[.])youtu[.]be$' then 'youtube'
    when lower(coalesce(p_referrer_host, '')) ~ '(^|[.])linkedin[.]com$' then 'linkedin'
    when lower(coalesce(p_referrer_host, '')) ~ '(^|[.])lnkd[.]in$' then 'linkedin'
    when lower(coalesce(p_referrer_host, '')) ~ '(^|[.])(twitter|x)[.]com$' then 'x'
    when nullif(trim(p_referrer_host), '') is not null then 'other'
    when lower(coalesce(p_source, '')) in ('instagram', 'tiktok', 'youtube', 'linkedin', 'x') then lower(p_source)
    when lower(coalesce(p_source, 'direct')) in ('direct', '')
      and lower(coalesce(p_platform, '')) in ('instagram', 'tiktok', 'youtube', 'linkedin', 'x')
      then lower(p_platform)
    else 'direct'
  end;
$$;

revoke all on function public.discovery_classify_traffic_source(text, text, text, text) from public;
grant execute on function public.discovery_classify_traffic_source(text, text, text, text) to authenticated;

create or replace function public.discovery_profile_traffic_sources(
  p_profile_id uuid,
  p_range_days integer default 30
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
  result jsonb;
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

  select jsonb_build_object(
    'traffic_sources', coalesce((
      select jsonb_agg(jsonb_build_object('key', key, 'count', n) order by n desc)
      from (
        select public.discovery_classify_traffic_source(e.source, e.utm_source, e.referrer_host, e.platform) as key,
          count(*) as n
        from public.discovery_events e
        where e.profile_id = p_profile_id
          and e.event_type = 'profile_view'
          and e.created_at >= range_start
        group by 1
      ) s
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.discovery_profile_traffic_sources(uuid, integer) from public;
grant execute on function public.discovery_profile_traffic_sources(uuid, integer) to authenticated;

drop function if exists public.discovery_track_event(uuid, text, text, text, uuid, text, text, text, text, text);

create function public.discovery_track_event(
  p_profile_id uuid,
  p_event_type text,
  p_source text default null,
  p_platform text default null,
  p_content_id uuid default null,
  p_visitor_key text default null,
  p_destination text default null,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_referrer_host text default null,
  p_utm_campaign text default null
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
  clean_utm_campaign text;
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
    'profile_external_click',
    'connection_contact_click'
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
  if clean_source in ('explore', 'search', 'category', 'following', 'saved', 'recommendation') then
    clean_source := 'sharpz_' || clean_source;
  end if;
  if clean_source is null or clean_source not in (
    'explore', 'search', 'category', 'direct', 'following', 'saved',
    'sharpz_explore', 'sharpz_search', 'sharpz_category',
    'sharpz_following', 'sharpz_saved', 'sharpz_recommendation',
    'instagram', 'youtube', 'tiktok', 'x', 'linkedin', 'website', 'other'
  ) then
    clean_source := 'direct';
  end if;

  clean_platform := left(lower(nullif(trim(p_platform), '')), 40);
  clean_utm_source := left(lower(nullif(trim(p_utm_source), '')), 40);
  clean_utm_medium := left(lower(nullif(trim(p_utm_medium), '')), 40);
  clean_utm_campaign := left(lower(nullif(trim(p_utm_campaign), '')), 80);
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
        and coalesce(e.source, '') = coalesce(clean_source, '')
        and coalesce(e.utm_source, '') = coalesce(clean_utm_source, '')
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
    utm_campaign,
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
    clean_utm_campaign,
    clean_referrer
  );

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.discovery_track_event(
  uuid, text, text, text, uuid, text, text, text, text, text, text
) from public;
grant execute on function public.discovery_track_event(
  uuid, text, text, text, uuid, text, text, text, text, text, text
) to anon, authenticated;
