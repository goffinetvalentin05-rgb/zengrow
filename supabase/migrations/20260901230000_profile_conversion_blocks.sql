-- Conversion CTA + premium profile blocks for Sharpz Pro.
-- Additive. Reuses discovery_events. Does not drop existing objects.

alter table public.profiles
  add column if not exists cta_label text;

alter table public.profiles
  add column if not exists cta_url text;

alter table public.profiles
  add column if not exists cta_type text not null default 'custom';

alter table public.profiles
  drop constraint if exists profiles_cta_type_chk;

alter table public.profiles
  add constraint profiles_cta_type_chk
  check (cta_type in (
    'project',
    'website',
    'booking',
    'newsletter',
    'community',
    'content',
    'contact',
    'custom'
  ));

comment on column public.profiles.cta_label is 'Primary conversion CTA label on the public profile.';
comment on column public.profiles.cta_url is 'Primary conversion CTA destination URL.';
comment on column public.profiles.cta_type is 'Primary conversion CTA type.';

create table if not exists public.profile_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  block_type text not null,
  title text,
  description text,
  cta_label text,
  url text,
  sort_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_blocks_type_chk
    check (block_type in (
      'featured_project',
      'featured_video',
      'newsletter',
      'booking',
      'offer',
      'community',
      'custom'
    ))
);

create index if not exists profile_blocks_profile_idx
  on public.profile_blocks (profile_id, is_active, sort_index);

drop trigger if exists profile_blocks_set_updated_at on public.profile_blocks;
create trigger profile_blocks_set_updated_at
  before update on public.profile_blocks
  for each row execute function public.discovery_set_updated_at();

create or replace function public.profile_blocks_active_limit()
returns trigger
language plpgsql
as $$
declare
  active_count integer;
begin
  if new.is_active is not true then
    return new;
  end if;
  select count(*) into active_count
  from public.profile_blocks
  where profile_id = new.profile_id
    and is_active = true
    and id is distinct from new.id;
  if active_count >= 3 then
    raise exception 'Maximum 3 active premium blocks.';
  end if;
  return new;
end;
$$;

drop trigger if exists profile_blocks_active_limit on public.profile_blocks;
create trigger profile_blocks_active_limit
  before insert or update on public.profile_blocks
  for each row execute function public.profile_blocks_active_limit();

alter table public.profile_blocks enable row level security;

drop policy if exists profile_blocks_read on public.profile_blocks;
create policy profile_blocks_read on public.profile_blocks
  for select using (
    public.discovery_is_admin()
    or profile_id = public.discovery_my_profile_id()
    or (
      is_active = true
      and exists (
        select 1 from public.profiles p
        where p.id = profile_blocks.profile_id
          and p.is_public = true
          and p.is_disabled = false
      )
    )
  );

drop policy if exists profile_blocks_self_write on public.profile_blocks;
create policy profile_blocks_self_write on public.profile_blocks
  for all using (
    profile_id = public.discovery_my_profile_id()
    or public.discovery_is_admin()
  ) with check (
    profile_id = public.discovery_my_profile_id()
    or public.discovery_is_admin()
  );

grant select on table public.profile_blocks to anon, authenticated;
grant insert, update, delete on table public.profile_blocks to authenticated;
grant all on table public.profile_blocks to service_role;

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
    'connection_contact_click',
    'profile_cta_click',
    'premium_block_click'
  ));

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
