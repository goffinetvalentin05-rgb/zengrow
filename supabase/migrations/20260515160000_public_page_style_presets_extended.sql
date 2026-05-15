-- Styles de page étendus (minimal, premium_dark)

alter table public.restaurants
  drop constraint if exists restaurants_public_style_preset_check;

alter table public.restaurants
  add constraint restaurants_public_style_preset_check
  check (
    public_style_preset is null
    or public_style_preset in ('elegant', 'modern', 'warm', 'minimal', 'premium_dark')
  );
