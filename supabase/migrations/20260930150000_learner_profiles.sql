-- Learner profiles for the English app.
-- Does not drop Discovery, Growth OS, or restaurant tables.

create or replace function public.learner_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.learner_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text,
  ui_language text not null default 'fr',
  level text,
  onboarding_completed boolean not null default false,
  timezone text,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_study_on date,
  primary_goal text,
  weekly_minutes integer,
  preferred_activities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learner_profiles_ui_language_chk check (ui_language in ('fr', 'en')),
  constraint learner_profiles_weekly_minutes_chk check (weekly_minutes is null or weekly_minutes > 0),
  constraint learner_profiles_streak_chk check (current_streak >= 0 and longest_streak >= 0)
);

drop trigger if exists learner_profiles_set_updated_at on public.learner_profiles;
create trigger learner_profiles_set_updated_at
  before update on public.learner_profiles
  for each row execute function public.learner_set_updated_at();

alter table public.learner_profiles enable row level security;

drop policy if exists learner_profiles_select_own on public.learner_profiles;
create policy learner_profiles_select_own on public.learner_profiles
  for select using (user_id = auth.uid());

drop policy if exists learner_profiles_insert_own on public.learner_profiles;
create policy learner_profiles_insert_own on public.learner_profiles
  for insert with check (user_id = auth.uid());

drop policy if exists learner_profiles_update_own on public.learner_profiles;
create policy learner_profiles_update_own on public.learner_profiles
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.learner_profiles to authenticated;
grant all on public.learner_profiles to service_role;

insert into public.learner_profiles (user_id, display_name)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'display_name'), ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), '')
  )
from auth.users u
where not exists (
  select 1 from public.learner_profiles lp where lp.user_id = u.id
);

insert into public.user_subscriptions (user_id, plan, status)
select u.id, 'free', 'inactive'
from auth.users u
where not exists (
  select 1 from public.user_subscriptions s where s.user_id = u.id
);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'display_name'
  ) then
    update public.learner_profiles lp
    set display_name = p.display_name
    from public.profiles p
    where p.user_id = lp.user_id
      and nullif(trim(p.display_name), '') is not null
      and (lp.display_name is null or lp.display_name = '');
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'preferred_language'
  ) then
    update public.learner_profiles lp
    set ui_language = p.preferred_language
    from public.profiles p
    where p.user_id = lp.user_id
      and p.preferred_language in ('fr', 'en');
  end if;
end $$;

-- user_subscriptions.updated_at no longer depends on discovery_set_updated_at()
drop trigger if exists user_subscriptions_set_updated_at on public.user_subscriptions;
create trigger user_subscriptions_set_updated_at
  before update on public.user_subscriptions
  for each row execute function public.learner_set_updated_at();

drop policy if exists user_subscriptions_self on public.user_subscriptions;
create policy user_subscriptions_self on public.user_subscriptions
  for select using (user_id = auth.uid());

drop policy if exists user_subscriptions_self_insert on public.user_subscriptions;
create policy user_subscriptions_self_insert on public.user_subscriptions
  for insert with check (user_id = auth.uid());

drop policy if exists user_subscriptions_self_update on public.user_subscriptions;
create policy user_subscriptions_self_update on public.user_subscriptions
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.learner_handle_new_user()
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
    nullif(split_part(coalesce(new.email, ''), '@', 1), '')
  );

  insert into public.learner_profiles (user_id, display_name)
  values (new.id, generated_name)
  on conflict (user_id) do nothing;

  insert into public.user_subscriptions (user_id, plan, status)
  values (new.id, 'free', 'inactive')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists discovery_on_auth_user_created on auth.users;
drop trigger if exists learner_on_auth_user_created on auth.users;
create trigger learner_on_auth_user_created
  after insert on auth.users
  for each row execute function public.learner_handle_new_user();

drop function if exists public.discovery_handle_new_user();
