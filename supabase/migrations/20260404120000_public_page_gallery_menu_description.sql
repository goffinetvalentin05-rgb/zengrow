-- Public page: gallery, menu (URL or PDF), short description for /r/[slug]

alter table public.restaurant_settings
  add column if not exists public_page_description text,
  add column if not exists gallery_image_urls text[] not null default '{}',
  add column if not exists public_menu_mode text,
  add column if not exists public_menu_url text,
  add column if not exists public_menu_pdf_url text;

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_public_menu_mode_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_public_menu_mode_check
  check (public_menu_mode is null or public_menu_mode in ('url', 'pdf'));

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_public_page_description_length_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_public_page_description_length_check
  check (public_page_description is null or char_length(public_page_description) <= 300);

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_gallery_image_urls_max_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_gallery_image_urls_max_check
  check (coalesce(array_length(gallery_image_urls, 1), 0) <= 6);
