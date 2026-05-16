-- Toggles d'affichage granulaires : initialisation `data.display` pour les restos existants.
-- Tous les show* à true pour ne pas modifier le rendu actuel.

insert into public.restaurant_page_sections (restaurant_id, section_type, sort_index, enabled, data)
select
  r.id,
  'practical',
  50,
  true,
  jsonb_build_object(
    'display', jsonb_build_object(
      'showEyebrow', true,
      'showSectionTitle', true,
      'showAddress', coalesce(rs.public_page_show_address, true),
      'showDirections', coalesce(r.show_public_google_maps, true),
      'showPhone', coalesce(rs.public_page_show_phone, true),
      'showEmail', coalesce(rs.public_page_show_email, true),
      'showWebsite', coalesce(rs.public_page_show_website, true),
      'showHours', coalesce(rs.public_page_show_opening_hours, true),
      'showParking', true,
      'showAccessibility', true,
      'showInstagram', coalesce(r.show_public_instagram, true),
      'showFacebook', coalesce(r.show_public_facebook, true),
      'showTiktok', true,
      'showSocialBar', true
    )
  )
from public.restaurants r
join public.restaurant_settings rs on rs.restaurant_id = r.id
on conflict (restaurant_id, section_type) do update
set data = public.restaurant_page_sections.data || excluded.data;

-- Hero : display par défaut tout visible
insert into public.restaurant_page_sections (restaurant_id, section_type, sort_index, enabled, data)
select r.id, 'hero', 10, true, jsonb_build_object(
  'display', jsonb_build_object(
    'showCoverImage', true,
    'showBadge', true,
    'showLogo', true,
    'showTitle', true,
    'showTagline', true,
    'showOpenStatus', true,
    'showPhone', coalesce(rs.show_phone_cta, true),
    'showPrimaryCta', true,
    'showSecondaryCta', true,
    'showScrollHint', true
  )
)
from public.restaurants r
join public.restaurant_settings rs on rs.restaurant_id = r.id
on conflict (restaurant_id, section_type) do update
set data = public.restaurant_page_sections.data || excluded.data;
