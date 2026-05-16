-- Étape 6 — Suppression tables / colonnes plan de salle
-- Prérequis : 20260522120000 (backup + simple) et 20260522130000 (RPC) appliqués + code déployé.

drop function if exists public.replace_restaurant_tables(uuid, jsonb);

alter table public.reservations drop column if exists table_id;
alter table public.reservations drop column if exists floor_plan_id;

alter table public.restaurant_settings
  drop column if exists reservation_mode,
  drop column if exists use_tables,
  drop column if exists floor_plan_public_selection_mode,
  drop column if exists public_table_selection_mode,
  drop column if exists floor_plan_clients_choose_table,
  drop column if exists floor_plan_lunch_duration,
  drop column if exists floor_plan_dinner_duration,
  drop column if exists floor_plan_auto_assign,
  drop column if exists floor_plan_background_url,
  drop column if exists floor_plan_background_opacity;

drop table if exists public.floor_plan_elements cascade;
drop table if exists public.restaurant_tables cascade;
drop table if exists public.floor_plans cascade;
drop table if exists public.restaurant_zones cascade;
