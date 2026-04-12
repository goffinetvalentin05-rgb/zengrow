-- Archivage automatique des réservations (filtrage côté app selon heure + durée du repas)
alter table public.restaurant_settings
  add column if not exists auto_archive_reservations boolean not null default false;

comment on column public.restaurant_settings.auto_archive_reservations is
  'When true, dashboard hides past reservations from the main list (end = reservation_time + reservation_duration) and shows them under Historique.';
