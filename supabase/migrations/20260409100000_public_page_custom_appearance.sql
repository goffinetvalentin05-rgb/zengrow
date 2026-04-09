-- Replace public page preset themes with full custom appearance controls

-- 1) Remove predefined theme key from restaurants
alter table public.restaurants
  drop constraint if exists restaurants_public_theme_key_check;

alter table public.restaurants
  drop column if exists public_theme_key;

-- 2) Add fully customizable appearance fields to restaurant_settings
alter table public.restaurant_settings
  add column if not exists text_color text,
  add column if not exists heading_font text,
  add column if not exists body_font text,
  add column if not exists font_size_scale text,
  add column if not exists border_radius text,
  add column if not exists button_style text,
  add column if not exists card_style text;

-- 3) Constraints / defaults (safe idempotent pattern)
alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_font_size_scale_check;
alter table public.restaurant_settings
  add constraint restaurant_settings_font_size_scale_check
  check (font_size_scale in ('small', 'medium', 'large'));

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_border_radius_check;
alter table public.restaurant_settings
  add constraint restaurant_settings_border_radius_check
  check (border_radius in ('sharp', 'rounded', 'pill'));

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_button_style_check;
alter table public.restaurant_settings
  add constraint restaurant_settings_button_style_check
  check (button_style in ('filled', 'outlined', 'ghost'));

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_card_style_check;
alter table public.restaurant_settings
  add constraint restaurant_settings_card_style_check
  check (card_style in ('flat', 'elevated', 'bordered'));

-- Default values (existing rows + future inserts)
update public.restaurant_settings
set
  text_color = coalesce(text_color, '#111827'),
  heading_font = coalesce(heading_font, 'Playfair Display'),
  body_font = coalesce(body_font, 'Inter'),
  font_size_scale = coalesce(font_size_scale, 'medium'),
  border_radius = coalesce(border_radius, 'rounded'),
  button_style = coalesce(button_style, 'filled'),
  card_style = coalesce(card_style, 'elevated');

alter table public.restaurant_settings
  alter column text_color set default '#111827',
  alter column heading_font set default 'Playfair Display',
  alter column body_font set default 'Inter',
  alter column font_size_scale set default 'medium',
  alter column border_radius set default 'rounded',
  alter column button_style set default 'filled',
  alter column card_style set default 'elevated';

