alter table public.email_campaign_recipients
  add column if not exists opened_at timestamptz;

comment on column public.email_campaign_recipients.opened_at is
  'Première ouverture détectée (pixel de suivi dans l’e-mail).';
