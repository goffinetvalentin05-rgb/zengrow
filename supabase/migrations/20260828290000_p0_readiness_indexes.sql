-- P0.6 — Indexes readiness (requêtes fréquentes Growth OS uniquement).

-- Relances Dashboard / notifications (déjà partiel via prospects_restaurant_follow_up_idx)
create index if not exists prospects_restaurant_next_follow_up_idx
  on public.prospects (restaurant_id, next_follow_up_at)
  where next_follow_up_at is not null;

-- Expériences due / overdue
create index if not exists experiments_restaurant_status_planned_end_idx
  on public.experiments (restaurant_id, status, planned_end_at);

-- Cron veille concurrents : actifs, plus anciens first
create index if not exists competitors_active_last_checked_idx
  on public.competitors (last_checked_at nulls first)
  where active = true;

-- Timeline Market
create index if not exists competitor_changes_restaurant_created_desc_idx
  on public.competitor_changes (restaurant_id, created_at desc);
