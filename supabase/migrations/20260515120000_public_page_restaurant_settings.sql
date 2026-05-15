-- Personnalisation page publique : champs structurés (complète restaurant_public_page_config JSON)

alter table public.restaurants
  add column if not exists cuisine_type text,
  add column if not exists tiktok_url text,
  add column if not exists public_secondary_color text,
  add column if not exists public_style_preset text,
  add column if not exists public_ambiance text,
  add column if not exists public_hero_title text,
  add column if not exists public_seo_title text,
  add column if not exists public_seo_description text,
  add column if not exists public_page_status text not null default 'published',
  add column if not exists public_page_published_at timestamptz,
  add column if not exists public_page_draft_updated_at timestamptz;

alter table public.restaurants
  drop constraint if exists restaurants_public_style_preset_check;

alter table public.restaurants
  add constraint restaurants_public_style_preset_check
  check (public_style_preset is null or public_style_preset in ('elegant', 'modern', 'warm'));

alter table public.restaurants
  drop constraint if exists restaurants_public_ambiance_check;

alter table public.restaurants
  add constraint restaurants_public_ambiance_check
  check (
    public_ambiance is null
    or public_ambiance in (
      'gastronomic',
      'family',
      'bistro',
      'italian',
      'asian',
      'cafe_brunch',
      'bar_lounge',
      'other'
    )
  );

alter table public.restaurants
  drop constraint if exists restaurants_public_page_status_check;

alter table public.restaurants
  add constraint restaurants_public_page_status_check
  check (public_page_status in ('draft', 'published'));

-- Les restaurants existants restent accessibles publiquement
update public.restaurants
set public_page_status = 'published'
where public_page_status is distinct from 'published';

alter table public.restaurants
  drop constraint if exists restaurants_public_hero_title_length_check;

alter table public.restaurants
  add constraint restaurants_public_hero_title_length_check
  check (public_hero_title is null or char_length(public_hero_title) <= 120);

alter table public.restaurants
  drop constraint if exists restaurants_public_seo_title_length_check;

alter table public.restaurants
  add constraint restaurants_public_seo_title_length_check
  check (public_seo_title is null or char_length(public_seo_title) <= 70);

alter table public.restaurants
  drop constraint if exists restaurants_public_seo_description_length_check;

alter table public.restaurants
  add constraint restaurants_public_seo_description_length_check
  check (public_seo_description is null or char_length(public_seo_description) <= 160);

alter table public.restaurant_settings
  add column if not exists public_highlights jsonb not null default '[]'::jsonb,
  add column if not exists featured_gallery_index integer not null default 0,
  add column if not exists public_reservation_enabled boolean not null default true,
  add column if not exists min_booking_lead_minutes integer not null default 0,
  add column if not exists no_slots_message text,
  add column if not exists show_hours_before_form boolean not null default true,
  add column if not exists show_phone_cta boolean not null default true,
  add column if not exists special_message text;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_public_highlights_max_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_public_highlights_max_check
  check (jsonb_array_length(public_highlights) <= 3);

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_featured_gallery_index_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_featured_gallery_index_check
  check (featured_gallery_index >= 0 and featured_gallery_index <= 5);

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_special_message_length_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_special_message_length_check
  check (special_message is null or char_length(special_message) <= 200);

comment on column public.restaurants.public_page_status is
  'draft = non publiée ; published = visible sur /r/[slug]';
