-- Allow hyphens in public usernames used as short Sharpz links.
-- Existing unique index on username is kept; no public_slug column.

alter table public.profiles drop constraint if exists profiles_username_format_chk;

alter table public.profiles
  add constraint profiles_username_format_chk
  check (username is null or username ~ '^[a-z0-9]([a-z0-9_-]{1,28}[a-z0-9])$');
