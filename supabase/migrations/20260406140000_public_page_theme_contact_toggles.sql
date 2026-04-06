-- Public page theme + per-field contact visibility

alter table public.restaurant_settings
  add column if not exists public_page_background_color text default '#12151c',
  add column if not exists public_page_show_address boolean not null default true,
  add column if not exists public_page_show_phone boolean not null default true,
  add column if not exists public_page_show_email boolean not null default true,
  add column if not exists public_page_show_website boolean not null default true,
  add column if not exists public_page_show_opening_hours boolean not null default true;

comment on column public.restaurant_settings.public_page_background_color is 'Background color for the public reservation page (hex).';
comment on column public.restaurant_settings.public_page_show_address is 'Show address on public page when set.';
comment on column public.restaurant_settings.public_page_show_phone is 'Show phone on public page when set.';
comment on column public.restaurant_settings.public_page_show_email is 'Show email on public page when set.';
comment on column public.restaurant_settings.public_page_show_website is 'Show website link on public page when set.';
comment on column public.restaurant_settings.public_page_show_opening_hours is 'Show opening hours on public page.';
