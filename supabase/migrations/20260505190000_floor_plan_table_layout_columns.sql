-- Colonnes de layout pour l'éditeur visuel (Plan de salle)
-- Ne casse pas les données existantes : valeurs par défaut pour les anciennes tables.

alter table public.restaurant_tables
  add column if not exists x_position integer not null default 100,
  add column if not exists y_position integer not null default 100,
  add column if not exists width integer not null default 90,
  add column if not exists height integer not null default 90,
  add column if not exists shape text not null default 'round',
  add column if not exists rotation integer not null default 0,
  add column if not exists color text;

-- Valeurs sûres
alter table public.restaurant_tables
  drop constraint if exists restaurant_tables_shape_check;

alter table public.restaurant_tables
  add constraint restaurant_tables_shape_check
  check (shape in ('round', 'square', 'rectangle'));

-- Clamp basique (évite des valeurs négatives si un jour des données ont été importées)
update public.restaurant_tables
set
  x_position = greatest(0, coalesce(x_position, 100)),
  y_position = greatest(0, coalesce(y_position, 100)),
  width = greatest(30, coalesce(width, 90)),
  height = greatest(30, coalesce(height, 90)),
  rotation = coalesce(rotation, 0)
where true;

-- Index (UX : canvas / selection)
create index if not exists restaurant_tables_restaurant_layout_idx
  on public.restaurant_tables (restaurant_id, x_position, y_position);

