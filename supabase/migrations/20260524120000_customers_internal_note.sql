-- Notes internes par fiche client (CRM restaurateur).
alter table public.customers
  add column if not exists internal_note text;
