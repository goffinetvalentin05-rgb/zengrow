-- Onboarding pass: timestamp, grandfather existing complete profiles,
-- extra role/status values used by the 4-step flow.

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

alter table public.profiles drop constraint if exists profiles_profile_type_chk;
alter table public.profiles
  add constraint profiles_profile_type_chk
  check (
    profile_type is null or profile_type in (
      'builder',
      'founder',
      'creator',
      'operator',
      'freelancer',
      'coach',
      'investor',
      'other',
      'marketer',
      'developer'
    )
  );

alter table public.projects drop constraint if exists projects_status_chk;
alter table public.projects
  add constraint projects_status_chk
  check (status in ('building', 'launched', 'paused', 'exited', 'growing', 'exploring'));

update public.profiles
set onboarding_completed_at = coalesce(onboarding_completed_at, updated_at, now())
where onboarding_completed = true
  and onboarding_completed_at is null;

-- Existing members who already have a public identity + niches
-- should not be forced through the new 4-step flow.
update public.profiles p
set
  onboarding_completed = true,
  onboarding_completed_at = coalesce(p.onboarding_completed_at, p.updated_at, now()),
  onboarding_step = coalesce(nullif(p.onboarding_step, ''), 'done')
where p.onboarding_completed = false
  and p.username is not null
  and length(trim(p.username)) > 0
  and p.profile_type is not null
  and exists (
    select 1
    from public.profile_categories pc
    where pc.profile_id = p.id
  );
