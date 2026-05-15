alter table public.restaurants
  add column if not exists theme_id text not null default 'default',
  add column if not exists theme_overrides jsonb not null default '{}'::jsonb;

comment on column public.restaurants.theme_id is 'Thème visuel page publique (lib/themes registry).';
comment on column public.restaurants.theme_overrides is 'Surcharges couleur (accent, bg, …) pour le thème actif.';
