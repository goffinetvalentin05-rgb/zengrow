-- Personnalisation e-mail de confirmation de réservation (objet + corps texte, envoi toujours depuis ZenGrow)

alter table public.restaurants
  add column if not exists reservation_confirmation_email_subject text;

alter table public.restaurants
  add column if not exists reservation_confirmation_email_body text;

comment on column public.restaurants.reservation_confirmation_email_subject is
  'Objet personnalisé (texte + variables {{...}}). NULL ou vide = modèle par défaut ZenGrow.';

comment on column public.restaurants.reservation_confirmation_email_body is
  'Corps personnalisé en texte brut (retours à ligne + variables {{...}}). NULL ou vide = modèle par défaut.';
