-- Sharpz Discovery MVP
-- Additive schema for people-by-niche discovery.
-- Does NOT drop restaurants, user_saas, analytics_events, or any legacy tables.
-- FitMe `public.profiles` was dropped in 20260825120000; this recreates a new profiles table.

create extension if not exists pg_trgm;

create or replace function public.discovery_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Categories (niches)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_index integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_active_sort_idx
  on public.categories (is_active, sort_index, name);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.discovery_set_updated_at();

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  email text,
  display_name text not null default '',
  username text,
  bio text,
  avatar_url text,
  location text,
  country text,
  profile_type text,
  primary_category_id uuid references public.categories (id) on delete set null,
  role_label text,
  audience_size integer,
  audience_size_source text,
  is_public boolean not null default true,
  is_disabled boolean not null default false,
  is_featured boolean not null default false,
  featured_rank integer,
  editor_pick boolean not null default false,
  claim_status text not null default 'claimed',
  is_admin boolean not null default false,
  is_seed boolean not null default false,
  onboarding_completed boolean not null default false,
  onboarding_step text,
  completeness integer not null default 0,
  followers_count integer not null default 0,
  following_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_profile_type_chk
    check (profile_type is null or profile_type in (
      'builder', 'founder', 'creator', 'operator', 'freelancer', 'coach', 'investor', 'other'
    )),
  constraint profiles_audience_source_chk
    check (audience_size_source is null or audience_size_source in ('self_reported', 'synced')),
  constraint profiles_claim_status_chk
    check (claim_status in ('claimed', 'unclaimed')),
  constraint profiles_username_format_chk
    check (username is null or username ~ '^[a-z0-9_]{3,30}$'),
  constraint profiles_audience_size_chk
    check (audience_size is null or audience_size >= 0),
  constraint profiles_completeness_chk
    check (completeness >= 0 and completeness <= 100),
  constraint profiles_claimed_has_user_chk
    check (claim_status = 'unclaimed' or user_id is not null)
);

create unique index if not exists profiles_username_unique_idx
  on public.profiles (username)
  where username is not null;

create index if not exists profiles_public_discover_idx
  on public.profiles (is_public, is_disabled, created_at desc)
  where is_public = true and is_disabled = false;

create index if not exists profiles_primary_category_idx
  on public.profiles (primary_category_id)
  where is_public = true and is_disabled = false;

create index if not exists profiles_featured_idx
  on public.profiles (is_featured, featured_rank)
  where is_featured = true;

create index if not exists profiles_name_trgm_idx
  on public.profiles using gin (display_name gin_trgm_ops);

create index if not exists profiles_username_trgm_idx
  on public.profiles using gin (username gin_trgm_ops);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.discovery_set_updated_at();

-- ---------------------------------------------------------------------------
-- Profile ↔ categories (favorites + belonging)
-- ---------------------------------------------------------------------------
create table if not exists public.profile_categories (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (profile_id, category_id)
);

create index if not exists profile_categories_category_idx
  on public.profile_categories (category_id, profile_id);

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text,
  description text,
  url text,
  logo_url text,
  category text,
  status text not null default 'building',
  started_at date,
  milestone text,
  featured_project boolean not null default false,
  sort_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_status_chk
    check (status in ('building', 'launched', 'paused', 'exited'))
);

create unique index if not exists projects_one_featured_per_profile_idx
  on public.projects (owner_id)
  where featured_project = true;

create index if not exists projects_owner_idx
  on public.projects (owner_id, sort_index, created_at desc);

create index if not exists projects_name_trgm_idx
  on public.projects using gin (name gin_trgm_ops);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.discovery_set_updated_at();

-- ---------------------------------------------------------------------------
-- Social links
-- ---------------------------------------------------------------------------
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null,
  url text not null,
  follower_count integer,
  sort_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_links_platform_chk
    check (platform in ('instagram', 'youtube', 'tiktok', 'x', 'linkedin', 'website', 'other')),
  constraint social_links_follower_count_chk
    check (follower_count is null or follower_count >= 0),
  unique (profile_id, platform)
);

create index if not exists social_links_profile_idx
  on public.social_links (profile_id, sort_index);

drop trigger if exists social_links_set_updated_at on public.social_links;
create trigger social_links_set_updated_at
  before update on public.social_links
  for each row execute function public.discovery_set_updated_at();

-- ---------------------------------------------------------------------------
-- Featured content (hosted on original platforms — Sharpz only references)
-- ---------------------------------------------------------------------------
create table if not exists public.featured_content (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null,
  url text not null,
  title text,
  thumbnail_url text,
  sort_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint featured_content_platform_chk
    check (platform in ('youtube', 'instagram', 'tiktok', 'x', 'article', 'other'))
);

create index if not exists featured_content_profile_idx
  on public.featured_content (profile_id, sort_index);

drop trigger if exists featured_content_set_updated_at on public.featured_content;
create trigger featured_content_set_updated_at
  before update on public.featured_content
  for each row execute function public.discovery_set_updated_at();

create or replace function public.discovery_featured_limit()
returns trigger
language plpgsql
as $$
begin
  if (
    select count(*) from public.featured_content
    where profile_id = new.profile_id
      and (tg_op = 'INSERT' or id <> new.id)
  ) >= 6 then
    raise exception 'A profile can feature at most 6 contents';
  end if;
  return new;
end;
$$;

drop trigger if exists featured_content_limit on public.featured_content;
create trigger featured_content_limit
  before insert or update on public.featured_content
  for each row execute function public.discovery_featured_limit();

-- ---------------------------------------------------------------------------
-- Follows / saved
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_chk check (follower_id <> following_id)
);

create index if not exists follows_following_idx
  on public.follows (following_id, created_at desc);

create or replace function public.discovery_follows_sync_counts()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles
      set following_count = following_count + 1
      where id = new.follower_id;
    update public.profiles
      set followers_count = followers_count + 1
      where id = new.following_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.profiles
      set following_count = greatest(following_count - 1, 0)
      where id = old.follower_id;
    update public.profiles
      set followers_count = greatest(followers_count - 1, 0)
      where id = old.following_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists follows_sync_counts on public.follows;
create trigger follows_sync_counts
  after insert or delete on public.follows
  for each row execute function public.discovery_follows_sync_counts();

create table if not exists public.saved_profiles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, profile_id),
  constraint saved_profiles_no_self_chk check (user_id <> profile_id)
);

create index if not exists saved_profiles_profile_idx
  on public.saved_profiles (profile_id);

-- ---------------------------------------------------------------------------
-- Discovery analytics (separate from legacy public.analytics_events)
-- Privacy: no visitor identity stored. visitor_category_slug is denormalized
-- so we can aggregate "X% came from SaaS" without storing who visited.
-- ---------------------------------------------------------------------------
create table if not exists public.discovery_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  event_type text not null,
  source text,
  platform text,
  content_id uuid,
  visitor_category_slug text,
  created_at timestamptz not null default now(),
  constraint discovery_events_type_chk
    check (event_type in (
      'profile_view',
      'external_link_click',
      'featured_content_click',
      'project_click',
      'follow',
      'search_result_click'
    )),
  constraint discovery_events_source_chk
    check (source is null or source in (
      'explore', 'search', 'category', 'direct', 'following', 'saved'
    ))
);

create index if not exists discovery_events_profile_created_idx
  on public.discovery_events (profile_id, created_at desc);

create index if not exists discovery_events_profile_type_idx
  on public.discovery_events (profile_id, event_type, created_at desc);

-- ---------------------------------------------------------------------------
-- Subscriptions (user-level Sharpz Pro — independent of restaurants billing)
-- ---------------------------------------------------------------------------
create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_subscriptions_plan_chk check (plan in ('free', 'pro')),
  constraint user_subscriptions_status_chk
    check (status in ('inactive', 'active', 'canceled', 'past_due', 'trialing'))
);

create unique index if not exists user_subscriptions_stripe_customer_idx
  on public.user_subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists user_subscriptions_stripe_sub_idx
  on public.user_subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

drop trigger if exists user_subscriptions_set_updated_at on public.user_subscriptions;
create trigger user_subscriptions_set_updated_at
  before update on public.user_subscriptions
  for each row execute function public.discovery_set_updated_at();

-- ---------------------------------------------------------------------------
-- Claim requests (architecture for launch — admin reviews)
-- ---------------------------------------------------------------------------
create table if not exists public.profile_claims (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  claimant_user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending',
  proof_url text,
  proof_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint profile_claims_status_chk
    check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists profile_claims_profile_idx
  on public.profile_claims (profile_id, created_at desc);

create unique index if not exists profile_claims_one_pending_idx
  on public.profile_claims (profile_id, claimant_user_id)
  where status = 'pending';

-- ---------------------------------------------------------------------------
-- Reports
-- ---------------------------------------------------------------------------
create table if not exists public.profile_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  constraint profile_reports_status_chk
    check (status in ('open', 'reviewed', 'dismissed'))
);

create index if not exists profile_reports_status_idx
  on public.profile_reports (status, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------
create or replace function public.discovery_my_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function public.discovery_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select is_admin from public.profiles where user_id = auth.uid() limit 1
  ), false);
$$;

revoke all on function public.discovery_my_profile_id() from public;
revoke all on function public.discovery_is_admin() from public;
grant execute on function public.discovery_my_profile_id() to anon, authenticated;
grant execute on function public.discovery_is_admin() to anon, authenticated;

-- New auth user → claimed profile + free subscription
create or replace function public.discovery_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_name text;
begin
  generated_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (user_id, email, display_name, claim_status, is_public)
  values (new.id, new.email, generated_name, 'claimed', true)
  on conflict (user_id) do nothing;

  insert into public.user_subscriptions (user_id, plan, status)
  values (new.id, 'free', 'inactive')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists discovery_on_auth_user_created on auth.users;
create trigger discovery_on_auth_user_created
  after insert on auth.users
  for each row execute function public.discovery_handle_new_user();

-- Aggregated analytics only — never returns visitor identity
create or replace function public.discovery_profile_analytics(p_profile_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  allowed boolean;
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

  select jsonb_build_object(
    'views_total', (select count(*) from public.discovery_events e where e.profile_id = p_profile_id and e.event_type = 'profile_view'),
    'views_7d', (select count(*) from public.discovery_events e where e.profile_id = p_profile_id and e.event_type = 'profile_view' and e.created_at >= now() - interval '7 days'),
    'views_30d', (select count(*) from public.discovery_events e where e.profile_id = p_profile_id and e.event_type = 'profile_view' and e.created_at >= now() - interval '30 days'),
    'external_clicks', (select count(*) from public.discovery_events e where e.profile_id = p_profile_id and e.event_type in ('external_link_click', 'featured_content_click', 'project_click')),
    'clicks_by_platform', coalesce((
      select jsonb_object_agg(platform, n)
      from (
        select coalesce(e.platform, 'other') as platform, count(*) as n
        from public.discovery_events e
        where e.profile_id = p_profile_id
          and e.event_type in ('external_link_click', 'featured_content_click', 'project_click')
        group by coalesce(e.platform, 'other')
      ) s
    ), '{}'::jsonb),
    'sources', coalesce((
      select jsonb_object_agg(source, n)
      from (
        select coalesce(e.source, 'direct') as source, count(*) as n
        from public.discovery_events e
        where e.profile_id = p_profile_id and e.event_type = 'profile_view'
        group by coalesce(e.source, 'direct')
      ) s
    ), '{}'::jsonb),
    'visitor_niches', coalesce((
      select jsonb_agg(jsonb_build_object('slug', slug, 'share', share) order by share desc)
      from (
        select visitor_category_slug as slug,
          round(100.0 * count(*) / nullif(sum(count(*)) over (), 0), 0) as share
        from public.discovery_events e
        where e.profile_id = p_profile_id
          and e.event_type = 'profile_view'
          and e.visitor_category_slug is not null
        group by visitor_category_slug
      ) s
    ), '[]'::jsonb),
    'new_followers_7d', (
      select count(*) from public.follows f
      where f.following_id = p_profile_id and f.created_at >= now() - interval '7 days'
    ),
    'new_followers_30d', (
      select count(*) from public.follows f
      where f.following_id = p_profile_id and f.created_at >= now() - interval '30 days'
    ),
    'followers_total', (select followers_count from public.profiles where id = p_profile_id),
    'most_clicked_content', coalesce((
      select jsonb_agg(jsonb_build_object('content_id', content_id, 'clicks', n) order by n desc)
      from (
        select e.content_id, count(*) as n
        from public.discovery_events e
        where e.profile_id = p_profile_id
          and e.event_type = 'featured_content_click'
          and e.content_id is not null
        group by e.content_id
        order by n desc
        limit 5
      ) s
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.discovery_profile_analytics(uuid) from public;
grant execute on function public.discovery_profile_analytics(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_categories enable row level security;
alter table public.projects enable row level security;
alter table public.social_links enable row level security;
alter table public.featured_content enable row level security;
alter table public.follows enable row level security;
alter table public.saved_profiles enable row level security;
alter table public.discovery_events enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.profile_claims enable row level security;
alter table public.profile_reports enable row level security;

-- Categories
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (is_active = true or public.discovery_is_admin());

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all using (public.discovery_is_admin()) with check (public.discovery_is_admin());

-- Profiles
drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
  for select using (
    public.discovery_is_admin()
    or user_id = auth.uid()
    or (is_public = true and is_disabled = false)
  );

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
  for insert with check (
    user_id = auth.uid()
    or public.discovery_is_admin()
  );

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (
    user_id = auth.uid()
    or public.discovery_is_admin()
  ) with check (
    user_id = auth.uid()
    or public.discovery_is_admin()
  );

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles
  for delete using (public.discovery_is_admin());

-- Profile categories
drop policy if exists profile_categories_read on public.profile_categories;
create policy profile_categories_read on public.profile_categories
  for select using (
    public.discovery_is_admin()
    or profile_id = public.discovery_my_profile_id()
    or exists (
      select 1 from public.profiles p
      where p.id = profile_categories.profile_id
        and p.is_public = true
        and p.is_disabled = false
    )
  );

drop policy if exists profile_categories_self_write on public.profile_categories;
create policy profile_categories_self_write on public.profile_categories
  for all using (
    profile_id = public.discovery_my_profile_id()
    or public.discovery_is_admin()
  ) with check (
    profile_id = public.discovery_my_profile_id()
    or public.discovery_is_admin()
  );

-- Projects
drop policy if exists projects_read on public.projects;
create policy projects_read on public.projects
  for select using (
    public.discovery_is_admin()
    or owner_id = public.discovery_my_profile_id()
    or exists (
      select 1 from public.profiles p
      where p.id = projects.owner_id and p.is_public = true and p.is_disabled = false
    )
  );

drop policy if exists projects_self_write on public.projects;
create policy projects_self_write on public.projects
  for all using (
    owner_id = public.discovery_my_profile_id()
    or public.discovery_is_admin()
  ) with check (
    owner_id = public.discovery_my_profile_id()
    or public.discovery_is_admin()
  );

-- Social links
drop policy if exists social_links_read on public.social_links;
create policy social_links_read on public.social_links
  for select using (
    public.discovery_is_admin()
    or profile_id = public.discovery_my_profile_id()
    or exists (
      select 1 from public.profiles p
      where p.id = social_links.profile_id and p.is_public = true and p.is_disabled = false
    )
  );

drop policy if exists social_links_self_write on public.social_links;
create policy social_links_self_write on public.social_links
  for all using (
    profile_id = public.discovery_my_profile_id()
    or public.discovery_is_admin()
  ) with check (
    profile_id = public.discovery_my_profile_id()
    or public.discovery_is_admin()
  );

-- Featured content
drop policy if exists featured_content_read on public.featured_content;
create policy featured_content_read on public.featured_content
  for select using (
    public.discovery_is_admin()
    or profile_id = public.discovery_my_profile_id()
    or exists (
      select 1 from public.profiles p
      where p.id = featured_content.profile_id and p.is_public = true and p.is_disabled = false
    )
  );

drop policy if exists featured_content_self_write on public.featured_content;
create policy featured_content_self_write on public.featured_content
  for all using (
    profile_id = public.discovery_my_profile_id()
    or public.discovery_is_admin()
  ) with check (
    profile_id = public.discovery_my_profile_id()
    or public.discovery_is_admin()
  );

-- Follows
drop policy if exists follows_read on public.follows;
create policy follows_read on public.follows
  for select using (true);

drop policy if exists follows_self_insert on public.follows;
create policy follows_self_insert on public.follows
  for insert with check (follower_id = public.discovery_my_profile_id());

drop policy if exists follows_self_delete on public.follows;
create policy follows_self_delete on public.follows
  for delete using (follower_id = public.discovery_my_profile_id());

-- Saved
drop policy if exists saved_profiles_self on public.saved_profiles;
create policy saved_profiles_self on public.saved_profiles
  for all using (user_id = public.discovery_my_profile_id())
  with check (user_id = public.discovery_my_profile_id());

-- Events: insert allowed for tracking; raw rows only visible to owner/admin
drop policy if exists discovery_events_insert on public.discovery_events;
create policy discovery_events_insert on public.discovery_events
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = discovery_events.profile_id
        and p.is_public = true
        and p.is_disabled = false
    )
  );

drop policy if exists discovery_events_owner_read on public.discovery_events;
create policy discovery_events_owner_read on public.discovery_events
  for select using (
    public.discovery_is_admin()
    or profile_id = public.discovery_my_profile_id()
  );

-- Subscriptions
drop policy if exists user_subscriptions_self on public.user_subscriptions;
create policy user_subscriptions_self on public.user_subscriptions
  for select using (user_id = auth.uid() or public.discovery_is_admin());

drop policy if exists user_subscriptions_self_insert on public.user_subscriptions;
create policy user_subscriptions_self_insert on public.user_subscriptions
  for insert with check (user_id = auth.uid() or public.discovery_is_admin());

drop policy if exists user_subscriptions_self_update on public.user_subscriptions;
create policy user_subscriptions_self_update on public.user_subscriptions
  for update using (user_id = auth.uid() or public.discovery_is_admin())
  with check (user_id = auth.uid() or public.discovery_is_admin());

-- Claims
drop policy if exists profile_claims_read on public.profile_claims;
create policy profile_claims_read on public.profile_claims
  for select using (
    claimant_user_id = auth.uid() or public.discovery_is_admin()
  );

drop policy if exists profile_claims_insert on public.profile_claims;
create policy profile_claims_insert on public.profile_claims
  for insert with check (claimant_user_id = auth.uid());

drop policy if exists profile_claims_admin_update on public.profile_claims;
create policy profile_claims_admin_update on public.profile_claims
  for update using (public.discovery_is_admin()) with check (public.discovery_is_admin());

-- Reports
drop policy if exists profile_reports_insert on public.profile_reports;
create policy profile_reports_insert on public.profile_reports
  for insert with check (reporter_id = public.discovery_my_profile_id());

drop policy if exists profile_reports_read on public.profile_reports;
create policy profile_reports_read on public.profile_reports
  for select using (
    reporter_id = public.discovery_my_profile_id() or public.discovery_is_admin()
  );

drop policy if exists profile_reports_admin_update on public.profile_reports;
create policy profile_reports_admin_update on public.profile_reports
  for update using (public.discovery_is_admin()) with check (public.discovery_is_admin());

-- ---------------------------------------------------------------------------
-- Storage: avatars / logos / thumbnails (public read, owner write)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('discovery-media', 'discovery-media', true)
on conflict (id) do nothing;

drop policy if exists discovery_media_public_read on storage.objects;
create policy discovery_media_public_read
  on storage.objects for select
  using (bucket_id = 'discovery-media');

drop policy if exists discovery_media_auth_insert on storage.objects;
create policy discovery_media_auth_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'discovery-media'
    and (
      public.discovery_is_admin()
      or (storage.foldername(name))[1] = public.discovery_my_profile_id()::text
    )
  );

drop policy if exists discovery_media_auth_update on storage.objects;
create policy discovery_media_auth_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'discovery-media'
    and (
      public.discovery_is_admin()
      or (storage.foldername(name))[1] = public.discovery_my_profile_id()::text
    )
  )
  with check (
    bucket_id = 'discovery-media'
    and (
      public.discovery_is_admin()
      or (storage.foldername(name))[1] = public.discovery_my_profile_id()::text
    )
  );

drop policy if exists discovery_media_auth_delete on storage.objects;
create policy discovery_media_auth_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'discovery-media'
    and (
      public.discovery_is_admin()
      or (storage.foldername(name))[1] = public.discovery_my_profile_id()::text
    )
  );

-- ---------------------------------------------------------------------------
-- Seed categories (product data, not fake people)
-- ---------------------------------------------------------------------------
insert into public.categories (name, slug, description, sort_index, is_featured)
values
  ('SaaS', 'saas', 'People building software products.', 10, true),
  ('E-commerce', 'ecommerce', 'Operators and founders in online retail.', 20, true),
  ('Agency', 'agency', 'Studio and agency founders.', 30, true),
  ('OFM', 'ofm', 'Operators building in OFM.', 40, true),
  ('Creators', 'creators', 'People who publish and build in public.', 50, true),
  ('AI', 'ai', 'Builders around applied AI.', 60, true),
  ('Real Estate', 'real-estate', 'People building in real estate.', 70, false),
  ('Marketing', 'marketing', 'Marketers and growth operators.', 80, true),
  ('Sales', 'sales', 'People who sell and build sales systems.', 90, false),
  ('Freelancing', 'freelancing', 'Independent operators and specialists.', 100, false),
  ('Sport', 'sport', 'Athletes, coaches and sports operators.', 110, false),
  ('Investing', 'investing', 'Investors and people building around capital.', 120, false)
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      sort_index = excluded.sort_index,
      is_featured = excluded.is_featured,
      is_active = true;
