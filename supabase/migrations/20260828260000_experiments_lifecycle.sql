-- P0.3 — Expérimentations : cycle de vie + métriques avant/après (données réelles uniquement).

alter table public.experiments
  add column if not exists title text,
  add column if not exists metric text,
  add column if not exists metric_source text,
  add column if not exists before_value numeric,
  add column if not exists after_value numeric,
  add column if not exists delta_absolute numeric,
  add column if not exists delta_percent numeric,
  add column if not exists planned_end_at timestamptz,
  add column if not exists notes text;

alter table public.experiments
  drop constraint if exists experiments_status_chk;

alter table public.experiments
  add constraint experiments_status_chk
  check (status in ('draft', 'running', 'completed', 'cancelled'));

comment on column public.experiments.metric is
  'Clé métrique V1 (ex. visitors_7d). Null si non mesurable.';
comment on column public.experiments.metric_source is
  'Source honnête : sharpz_analytics | stripe | prospects_crm | null';
comment on column public.experiments.before_value is
  'Snapshot réel au démarrage — jamais inventé.';
comment on column public.experiments.after_value is
  'Snapshot réel à la clôture — jamais inventé.';
