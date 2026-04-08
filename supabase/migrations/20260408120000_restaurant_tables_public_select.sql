-- Lecture publique des tables pour cohérence avec les politiques (ex. requêtes futures côté client).
-- Les RPC security definer contournent RLS ; cette policy couvre les SELECT directs anon/authenticated.

drop policy if exists "restaurant_tables_public_select" on public.restaurant_tables;

create policy "restaurant_tables_public_select"
on public.restaurant_tables for select
using (true);
