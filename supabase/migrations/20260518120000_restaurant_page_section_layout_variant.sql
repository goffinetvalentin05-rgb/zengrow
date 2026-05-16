-- Variante de mise en page par section (clé définie dans le catalogue du thème actif).

alter table public.restaurant_page_sections
  add column if not exists layout_variant text;

comment on column public.restaurant_page_sections.layout_variant is
  'Clé de variante de layout (ex. editorial-list, masonry). Null = défaut du thème pour ce type de section.';
