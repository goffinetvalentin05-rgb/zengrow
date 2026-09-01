-- Optional accent + content layout for public personal pages.
-- Additive. Keeps theme_key, cover_image_url, featured_first.

alter table public.profiles
  add column if not exists accent_color text;

alter table public.profiles
  add column if not exists layout_variant text not null default 'default';

alter table public.profiles
  drop constraint if exists profiles_accent_color_chk;

alter table public.profiles
  add constraint profiles_accent_color_chk
  check (accent_color is null or accent_color ~ '^#[0-9a-fA-F]{6}$');

alter table public.profiles
  drop constraint if exists profiles_layout_variant_chk;

alter table public.profiles
  add constraint profiles_layout_variant_chk
  check (layout_variant in ('default', 'content_first', 'project_first'));

update public.profiles
  set layout_variant = 'content_first'
  where featured_first = true
    and layout_variant = 'default';
