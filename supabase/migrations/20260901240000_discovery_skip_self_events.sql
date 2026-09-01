-- Exclude owner self-traffic from discovery analytics.
-- Additive. CREATE OR REPLACE only. Does not alter tables or delete existing events.

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
    'connection_contact_click',
    'profile_cta_click',
    'premium_block_click'
  ) then
    return jsonb_build_object('ok', false, 'error', 'invalid_event');
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = p_profile_id and p.is_public = true and p.is_disabled = false
  ) then
    return jsonb_build_object('ok', false, 'error', 'profile_not_found');
  end if;

  -- Authenticated owner of this profile: never persist analytics events.
  -- Anonymous visitors (auth.uid() null → my_id null) stay tracked.
  my_id := public.discovery_my_profile_id();
  if my_id is not null and my_id = p_profile_id then
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
