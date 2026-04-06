-- Public page predefined theme (curated presets)

alter table public.restaurants
  add column if not exists public_theme_key text not null default 'moderne';

alter table public.restaurants
  drop constraint if exists restaurants_public_theme_key_check;

alter table public.restaurants
  add constraint restaurants_public_theme_key_check
  check (public_theme_key in ('moderne', 'classique', 'naturel', 'minimaliste'));

comment on column public.restaurants.public_theme_key is 'Predefined theme key applied on the public reservation page.';

