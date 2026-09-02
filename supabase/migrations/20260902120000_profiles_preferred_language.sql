-- Additive: persist UI language preference on discovery profiles.
alter table public.profiles
  add column if not exists preferred_language text;

alter table public.profiles
  drop constraint if exists profiles_preferred_language_chk;

alter table public.profiles
  add constraint profiles_preferred_language_chk
  check (preferred_language is null or preferred_language in ('fr', 'en'));

comment on column public.profiles.preferred_language is 'UI language preference: fr or en.';
