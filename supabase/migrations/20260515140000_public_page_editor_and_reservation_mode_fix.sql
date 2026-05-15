-- Éditeur page publique (config JSON) + correction reservation_mode invalide

alter table public.restaurant_settings
  add column if not exists public_page_editor_config jsonb not null default '{}'::jsonb;

comment on column public.restaurant_settings.public_page_editor_config is
  'Configuration éditeur page publique (blocs, hero, apparence étendue).';

-- Corriger les modes legacy encore présents
update public.restaurant_settings
set reservation_mode = case
  when reservation_mode in ('single_service', 'fixed_slots') then 'simple'
  when reservation_mode = 'physical_tables' then 'floor_plan'
  when reservation_mode in ('simple', 'floor_plan') then reservation_mode
  else 'simple'
end
where reservation_mode is null
   or reservation_mode not in ('simple', 'floor_plan');

alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_reservation_mode_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_reservation_mode_check
  check (reservation_mode in ('simple', 'floor_plan'));

alter table public.restaurant_settings
  alter column reservation_mode set default 'simple';

-- Points forts : jusqu'à 6 sur la page publique
alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_public_highlights_max_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_public_highlights_max_check
  check (jsonb_array_length(public_highlights) <= 6);

-- Galerie : jusqu'à 8 photos
alter table public.restaurant_settings
  drop constraint if exists restaurant_settings_gallery_image_urls_max_check;

alter table public.restaurant_settings
  add constraint restaurant_settings_gallery_image_urls_max_check
  check (coalesce(array_length(gallery_image_urls, 1), 0) <= 8);
