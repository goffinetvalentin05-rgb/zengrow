-- Full public page customization on restaurants + storage bucket "restaurants"

-- 1) Bucket for restaurant files (images, PDFs)
insert into storage.buckets (id, name, public)
values ('restaurants', 'restaurants', true)
on conflict (id) do nothing;

drop policy if exists "restaurants_public_read" on storage.objects;
create policy "restaurants_public_read"
on storage.objects for select
using (bucket_id = 'restaurants');

drop policy if exists "restaurants_authenticated_insert" on storage.objects;
create policy "restaurants_authenticated_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'restaurants');

drop policy if exists "restaurants_authenticated_update" on storage.objects;
create policy "restaurants_authenticated_update"
on storage.objects for update
to authenticated
using (bucket_id = 'restaurants')
with check (bucket_id = 'restaurants');

drop policy if exists "restaurants_authenticated_delete" on storage.objects;
create policy "restaurants_authenticated_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'restaurants');

-- 2) Appearance & public content columns on restaurants
alter table public.restaurants
  add column if not exists page_background_color text,
  add column if not exists hero_primary_color text,
  add column if not exists public_button_bg_color text,
  add column if not exists public_button_text_color text,
  add column if not exists public_heading_text_color text,
  add column if not exists public_body_text_color text,
  add column if not exists public_accent_color text,
  add column if not exists public_footer_bg_color text,
  add column if not exists public_footer_text_color text,
  add column if not exists public_heading_font text,
  add column if not exists public_body_font text,
  add column if not exists public_hero_title_size_px integer,
  add column if not exists public_display_name text,
  add column if not exists public_tagline text,
  add column if not exists public_description text,
  add column if not exists public_cta_label text,
  add column if not exists public_hero_height text,
  add column if not exists public_hero_overlay_enabled boolean,
  add column if not exists public_hero_overlay_opacity integer,
  add column if not exists google_maps_url text,
  add column if not exists show_public_instagram boolean,
  add column if not exists show_public_facebook boolean,
  add column if not exists show_public_google_maps boolean;

alter table public.restaurants
  drop constraint if exists restaurants_public_hero_height_check;
alter table public.restaurants
  add constraint restaurants_public_hero_height_check
  check (public_hero_height is null or public_hero_height in ('compact', 'normal', 'tall'));

alter table public.restaurants
  drop constraint if exists restaurants_public_hero_title_size_check;
alter table public.restaurants
  add constraint restaurants_public_hero_title_size_check
  check (
    public_hero_title_size_px is null
    or (public_hero_title_size_px >= 32 and public_hero_title_size_px <= 72)
  );

alter table public.restaurants
  drop constraint if exists restaurants_public_hero_overlay_opacity_check;
alter table public.restaurants
  add constraint restaurants_public_hero_overlay_opacity_check
  check (
    public_hero_overlay_opacity is null
    or (public_hero_overlay_opacity >= 0 and public_hero_overlay_opacity <= 80)
  );

-- Sensible defaults for existing rows (derive from legacy primary_color / settings when possible)
update public.restaurants r
set
  page_background_color = coalesce(r.page_background_color, '#f8fafc'),
  hero_primary_color = coalesce(r.hero_primary_color, r.primary_color, '#12151c'),
  public_button_bg_color = coalesce(r.public_button_bg_color, '#1F7A6C'),
  public_button_text_color = coalesce(r.public_button_text_color, '#ffffff'),
  public_heading_text_color = coalesce(r.public_heading_text_color, '#0f172a'),
  public_body_text_color = coalesce(r.public_body_text_color, '#334155'),
  public_accent_color = coalesce(r.public_accent_color, '#1F7A6C'),
  public_footer_bg_color = coalesce(r.public_footer_bg_color, '#0f172a'),
  public_footer_text_color = coalesce(r.public_footer_text_color, '#e2e8f0'),
  public_heading_font = coalesce(r.public_heading_font, 'Playfair Display'),
  public_body_font = coalesce(r.public_body_font, 'Inter'),
  public_hero_title_size_px = coalesce(r.public_hero_title_size_px, 48),
  public_cta_label = coalesce(nullif(trim(r.public_cta_label), ''), 'Réserver une table'),
  public_hero_height = coalesce(r.public_hero_height, 'normal'),
  public_hero_overlay_enabled = coalesce(r.public_hero_overlay_enabled, true),
  public_hero_overlay_opacity = coalesce(r.public_hero_overlay_opacity, 40),
  show_public_instagram = coalesce(r.show_public_instagram, true),
  show_public_facebook = coalesce(r.show_public_facebook, true),
  show_public_google_maps = coalesce(r.show_public_google_maps, true)
where true;

alter table public.restaurants
  alter column page_background_color set default '#f8fafc',
  alter column hero_primary_color set default '#12151c',
  alter column public_button_bg_color set default '#1F7A6C',
  alter column public_button_text_color set default '#ffffff',
  alter column public_heading_text_color set default '#0f172a',
  alter column public_body_text_color set default '#334155',
  alter column public_accent_color set default '#1F7A6C',
  alter column public_footer_bg_color set default '#0f172a',
  alter column public_footer_text_color set default '#e2e8f0',
  alter column public_heading_font set default 'Playfair Display',
  alter column public_body_font set default 'Inter',
  alter column public_hero_title_size_px set default 48,
  alter column public_cta_label set default 'Réserver une table',
  alter column public_hero_height set default 'normal',
  alter column public_hero_overlay_enabled set default true,
  alter column public_hero_overlay_opacity set default 40,
  alter column show_public_instagram set default true,
  alter column show_public_facebook set default true,
  alter column show_public_google_maps set default true;

comment on column public.restaurants.page_background_color is 'Public reservation page outer background.';
comment on column public.restaurants.hero_primary_color is 'Hero gradient / header tint (separate from page background).';
comment on column public.restaurants.public_description is 'Long public description (max 500 chars in app).';
