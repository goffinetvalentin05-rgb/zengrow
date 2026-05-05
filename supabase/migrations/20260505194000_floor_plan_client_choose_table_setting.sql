-- Option premium : le client choisit sa table sur le plan de salle (si activé)
alter table public.restaurant_settings
  add column if not exists floor_plan_clients_choose_table boolean not null default false;

