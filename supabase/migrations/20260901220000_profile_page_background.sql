-- Profile page background: solid colors, premium presets, optional full-page image.
-- Additive. Keeps theme_key, cover_image_url, layout_variant.

alter table public.profiles
  add column if not exists page_background_key text not null default 'void';

alter table public.profiles
  add column if not exists page_background_image_url text;

alter table public.profiles
  drop constraint if exists profiles_page_background_key_chk;

alter table public.profiles
  add constraint profiles_page_background_key_chk
  check (page_background_key in (
    'void',
    'graphite',
    'navy',
    'plum',
    'pine',
    'halo',
    'dusk',
    'ember',
    'mist',
    'aurora'
  ));

comment on column public.profiles.page_background_key is
  'Public profile page backdrop: solid or premium preset. Image overlay uses page_background_image_url.';

comment on column public.profiles.page_background_image_url is
  'Optional full-page background image. Takes visual precedence over page_background_key.';
