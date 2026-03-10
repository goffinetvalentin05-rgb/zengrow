alter table public.restaurants
  add column if not exists city text,
  add column if not exists country text,
  add column if not exists logo_url text,
  add column if not exists banner_url text,
  add column if not exists primary_color text;

alter table public.restaurant_settings
  add column if not exists table_count integer not null default 12;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_table_count_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_table_count_check check (table_count > 0);
