-- Sharpz Growth OS — additive schema (NOT applied yet).
-- Keeps restaurants as the existing tenant (auth, billing, RLS).
-- Does not drop or rename restaurant-domain tables.
--
-- Tenant isolation for Sharpz↔Sharpz relations:
--   UNIQUE (restaurant_id, id) on parents
--   FOREIGN KEY (restaurant_id, parent_id) REFERENCES parent (restaurant_id, id)
-- PostgreSQL MATCH SIMPLE + ON DELETE SET NULL (child_fk_only) requires PG 15+
-- (same generation as existing `execute function` migrations in this repo).

create or replace function public.sharpz_set_updated_at()
returns trigger
language plpgsql
as $sharpz_fn$
begin
  new.updated_at = now();
  return new;
end;
$sharpz_fn$;

create table if not exists public.user_saas (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null unique references public.restaurants (id) on delete cascade,
  name text,
  url text,
  description text,
  category text,
  country text,
  market text,
  language text,
  business_model text,
  pricing_detected boolean not null default false,
  pricing_summary text,
  billing_type text,
  mrr numeric,
  mrr_unknown boolean not null default true,
  has_freemium boolean,
  has_trial boolean,
  icp jsonb not null default '{}'::jsonb,
  stage text,
  scan_extract jsonb,
  unknown_fields text[] not null default '{}'::text[],
  onboarding_completed boolean not null default false,
  onboarding_step text,
  last_audit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_objectives (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  key text not null,
  is_primary boolean not null default false,
  custom_label text,
  created_at timestamptz not null default now(),
  unique (restaurant_id, key)
);

create unique index if not exists user_objectives_one_primary_per_restaurant_idx
  on public.user_objectives (restaurant_id)
  where is_primary;

create table if not exists public.acquisition_channels (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  channel text not null,
  custom_label text,
  created_at timestamptz not null default now(),
  unique (restaurant_id, channel)
);

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  status text not null default 'completed',
  summary text,
  global_score integer,
  previous_score integer,
  subscores jsonb not null default '{}'::jsonb,
  source_url text,
  raw_extract jsonb,
  created_at timestamptz not null default now(),
  constraint audits_restaurant_id_id_key unique (restaurant_id, id),
  constraint audits_global_score_range_chk
    check (global_score is null or (global_score >= 0 and global_score <= 100)),
  constraint audits_previous_score_range_chk
    check (previous_score is null or (previous_score >= 0 and previous_score <= 100))
);

create table if not exists public.audit_findings (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  audit_id uuid not null,
  kind text not null,
  area text not null,
  title text not null,
  detail text,
  severity integer,
  created_at timestamptz not null default now(),
  constraint audit_findings_audit_tenant_fkey
    foreign key (restaurant_id, audit_id)
    references public.audits (restaurant_id, id)
    on delete cascade,
  constraint audit_findings_kind_chk
    check (kind in ('problem', 'opportunity')),
  constraint audit_findings_severity_range_chk
    check (severity is null or (severity >= 1 and severity <= 10))
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  category text not null,
  explanation text,
  why_detected text,
  potential integer,
  effort integer,
  confidence integer,
  data_used text,
  opportunity_level text not null default 'medium',
  converted_action_id uuid,
  source_type text,
  source_id uuid,
  created_at timestamptz not null default now(),
  constraint opportunities_restaurant_id_id_key unique (restaurant_id, id),
  constraint opportunities_potential_range_chk
    check (potential is null or (potential >= 1 and potential <= 10)),
  constraint opportunities_effort_range_chk
    check (effort is null or (effort >= 1 and effort <= 10)),
  constraint opportunities_confidence_range_chk
    check (confidence is null or (confidence >= 0 and confidence <= 100))
);

create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  title text not null,
  category text not null,
  status text not null default 'todo',
  impact integer not null default 5,
  effort integer not null default 5,
  confidence integer not null default 50,
  score integer not null default 0,
  why text,
  how_to text,
  micro_steps jsonb not null default '[]'::jsonb,
  detected_at timestamptz not null default now(),
  objective_key text,
  source_type text,
  source_id uuid,
  opportunity_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint actions_restaurant_id_id_key unique (restaurant_id, id),
  constraint actions_status_chk
    check (status in ('todo', 'in_progress', 'done', 'ignored')),
  constraint actions_impact_range_chk
    check (impact >= 1 and impact <= 10),
  constraint actions_effort_range_chk
    check (effort >= 1 and effort <= 10),
  constraint actions_confidence_range_chk
    check (confidence >= 0 and confidence <= 100),
  constraint actions_score_range_chk
    check (score >= 0 and score <= 100),
  constraint actions_opportunity_tenant_fkey
    foreign key (restaurant_id, opportunity_id)
    references public.opportunities (restaurant_id, id)
    on delete set null (opportunity_id)
);

alter table public.opportunities
  drop constraint if exists opportunities_converted_action_tenant_fkey;
alter table public.opportunities
  add constraint opportunities_converted_action_tenant_fkey
  foreign key (restaurant_id, converted_action_id)
  references public.actions (restaurant_id, id)
  on delete set null (converted_action_id);

create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  url text,
  positioning text,
  pricing text,
  status text not null default 'watching',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint competitors_restaurant_id_id_key unique (restaurant_id, id)
);

create table if not exists public.competitor_changes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  competitor_id uuid,
  change_type text not null,
  what_changed text not null,
  importance text not null default 'medium',
  why_it_matters text,
  created_at timestamptz not null default now(),
  constraint competitor_changes_competitor_tenant_fkey
    foreign key (restaurant_id, competitor_id)
    references public.competitors (restaurant_id, id)
    on delete cascade
);

create table if not exists public.content_opportunities (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  topic text not null,
  audience text,
  potential integer,
  relevance integer,
  why_now text,
  recommended_angle text,
  created_at timestamptz not null default now(),
  constraint content_opportunities_restaurant_id_id_key unique (restaurant_id, id),
  constraint content_opportunities_potential_range_chk
    check (potential is null or (potential >= 0 and potential <= 100)),
  constraint content_opportunities_relevance_range_chk
    check (relevance is null or (relevance >= 0 and relevance <= 100))
);

create table if not exists public.content_ideas (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  opportunity_id uuid,
  platform text not null,
  hook text not null,
  angle text,
  objective text,
  format text,
  cta text,
  created_at timestamptz not null default now(),
  constraint content_ideas_opportunity_tenant_fkey
    foreign key (restaurant_id, opportunity_id)
    references public.content_opportunities (restaurant_id, id)
    on delete set null (opportunity_id)
);

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  company text not null,
  url text,
  contact text,
  why_fit text,
  fit_score integer,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prospects_fit_score_range_chk
    check (fit_score is null or (fit_score >= 0 and fit_score <= 100))
);

create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  hypothesis text not null,
  action_id uuid,
  action_description text,
  result text,
  conclusion text,
  status text not null default 'running',
  started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint experiments_restaurant_id_id_key unique (restaurant_id, id),
  constraint experiments_status_chk
    check (status in ('running', 'completed')),
  constraint experiments_action_tenant_fkey
    foreign key (restaurant_id, action_id)
    references public.actions (restaurant_id, id)
    on delete set null (action_id)
);

create table if not exists public.progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  period text not null,
  period_start date not null,
  metrics jsonb not null default '{}'::jsonb,
  actions_done integer not null default 0,
  actions_in_progress integer not null default 0,
  actions_ignored integer not null default 0,
  created_at timestamptz not null default now(),
  constraint progress_snapshots_period_chk
    check (period in ('week', 'month')),
  constraint progress_snapshots_restaurant_period_start_key
    unique (restaurant_id, period, period_start)
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  provider text not null,
  status text not null default 'coming_soon',
  config jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  unique (restaurant_id, provider)
);

-- Observed metric deltas after an action. Never implies proven causality by itself:
-- attribution_type distinguishes observed_after / correlated / experiment.
create table if not exists public.action_impacts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  action_id uuid not null,
  experiment_id uuid,
  metric text not null,
  before_value numeric,
  after_value numeric,
  delta_absolute numeric,
  delta_percent numeric,
  observed_from timestamptz,
  observed_to timestamptz,
  attribution_type text not null,
  confidence integer,
  evidence text,
  created_at timestamptz not null default now(),
  constraint action_impacts_action_tenant_fkey
    foreign key (restaurant_id, action_id)
    references public.actions (restaurant_id, id)
    on delete cascade,
  constraint action_impacts_experiment_tenant_fkey
    foreign key (restaurant_id, experiment_id)
    references public.experiments (restaurant_id, id)
    on delete set null (experiment_id),
  constraint action_impacts_attribution_type_chk
    check (attribution_type in ('observed_after', 'correlated', 'experiment')),
  constraint action_impacts_confidence_range_chk
    check (confidence is null or (confidence >= 0 and confidence <= 100)),
  constraint action_impacts_observed_window_chk
    check (observed_from is null or observed_to is null or observed_to >= observed_from)
);

create index if not exists audits_restaurant_created_idx
  on public.audits (restaurant_id, created_at desc);
create index if not exists audit_findings_restaurant_audit_idx
  on public.audit_findings (restaurant_id, audit_id);
create index if not exists actions_restaurant_status_idx
  on public.actions (restaurant_id, status);
create index if not exists actions_restaurant_score_idx
  on public.actions (restaurant_id, score desc);
create index if not exists actions_opportunity_id_idx
  on public.actions (opportunity_id)
  where opportunity_id is not null;
create index if not exists opportunities_restaurant_created_idx
  on public.opportunities (restaurant_id, created_at desc);
create index if not exists opportunities_converted_action_id_idx
  on public.opportunities (converted_action_id)
  where converted_action_id is not null;
create index if not exists competitors_restaurant_idx
  on public.competitors (restaurant_id);
create index if not exists competitor_changes_restaurant_created_idx
  on public.competitor_changes (restaurant_id, created_at desc);
create index if not exists competitor_changes_competitor_id_idx
  on public.competitor_changes (competitor_id)
  where competitor_id is not null;
create index if not exists content_opportunities_restaurant_created_idx
  on public.content_opportunities (restaurant_id, created_at desc);
create index if not exists content_ideas_restaurant_idx
  on public.content_ideas (restaurant_id);
create index if not exists content_ideas_opportunity_id_idx
  on public.content_ideas (opportunity_id)
  where opportunity_id is not null;
create index if not exists prospects_restaurant_created_idx
  on public.prospects (restaurant_id, created_at desc);
create index if not exists experiments_restaurant_created_idx
  on public.experiments (restaurant_id, created_at desc);
create index if not exists experiments_action_id_idx
  on public.experiments (action_id)
  where action_id is not null;
create index if not exists progress_snapshots_restaurant_start_idx
  on public.progress_snapshots (restaurant_id, period_start desc);
create index if not exists action_impacts_restaurant_action_idx
  on public.action_impacts (restaurant_id, action_id);
create index if not exists action_impacts_experiment_id_idx
  on public.action_impacts (experiment_id)
  where experiment_id is not null;
create index if not exists action_impacts_restaurant_created_idx
  on public.action_impacts (restaurant_id, created_at desc);

drop trigger if exists user_saas_set_updated_at on public.user_saas;
create trigger user_saas_set_updated_at
before update on public.user_saas
for each row execute function public.sharpz_set_updated_at();

drop trigger if exists actions_set_updated_at on public.actions;
create trigger actions_set_updated_at
before update on public.actions
for each row execute function public.sharpz_set_updated_at();

drop trigger if exists prospects_set_updated_at on public.prospects;
create trigger prospects_set_updated_at
before update on public.prospects
for each row execute function public.sharpz_set_updated_at();

-- RLS: statements explicites (pas de DO $$). L’éditeur SQL Supabase coupe
-- les blocs dollar-quoted sur les points-virgules internes.
alter table public.user_saas enable row level security;
alter table public.user_objectives enable row level security;
alter table public.acquisition_channels enable row level security;
alter table public.audits enable row level security;
alter table public.audit_findings enable row level security;
alter table public.opportunities enable row level security;
alter table public.actions enable row level security;
alter table public.competitors enable row level security;
alter table public.competitor_changes enable row level security;
alter table public.content_opportunities enable row level security;
alter table public.content_ideas enable row level security;
alter table public.prospects enable row level security;
alter table public.experiments enable row level security;
alter table public.progress_snapshots enable row level security;
alter table public.integrations enable row level security;
alter table public.action_impacts enable row level security;

drop policy if exists user_saas_owner_select on public.user_saas;
drop policy if exists user_saas_owner_insert on public.user_saas;
drop policy if exists user_saas_owner_update on public.user_saas;
drop policy if exists user_saas_owner_delete on public.user_saas;
create policy user_saas_owner_select on public.user_saas for select using (exists (select 1 from public.restaurants r where r.id = user_saas.restaurant_id and r.owner_id = auth.uid()));
create policy user_saas_owner_insert on public.user_saas for insert with check (exists (select 1 from public.restaurants r where r.id = user_saas.restaurant_id and r.owner_id = auth.uid()));
create policy user_saas_owner_update on public.user_saas for update using (exists (select 1 from public.restaurants r where r.id = user_saas.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = user_saas.restaurant_id and r.owner_id = auth.uid()));
create policy user_saas_owner_delete on public.user_saas for delete using (exists (select 1 from public.restaurants r where r.id = user_saas.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists user_objectives_owner_select on public.user_objectives;
drop policy if exists user_objectives_owner_insert on public.user_objectives;
drop policy if exists user_objectives_owner_update on public.user_objectives;
drop policy if exists user_objectives_owner_delete on public.user_objectives;
create policy user_objectives_owner_select on public.user_objectives for select using (exists (select 1 from public.restaurants r where r.id = user_objectives.restaurant_id and r.owner_id = auth.uid()));
create policy user_objectives_owner_insert on public.user_objectives for insert with check (exists (select 1 from public.restaurants r where r.id = user_objectives.restaurant_id and r.owner_id = auth.uid()));
create policy user_objectives_owner_update on public.user_objectives for update using (exists (select 1 from public.restaurants r where r.id = user_objectives.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = user_objectives.restaurant_id and r.owner_id = auth.uid()));
create policy user_objectives_owner_delete on public.user_objectives for delete using (exists (select 1 from public.restaurants r where r.id = user_objectives.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists acquisition_channels_owner_select on public.acquisition_channels;
drop policy if exists acquisition_channels_owner_insert on public.acquisition_channels;
drop policy if exists acquisition_channels_owner_update on public.acquisition_channels;
drop policy if exists acquisition_channels_owner_delete on public.acquisition_channels;
create policy acquisition_channels_owner_select on public.acquisition_channels for select using (exists (select 1 from public.restaurants r where r.id = acquisition_channels.restaurant_id and r.owner_id = auth.uid()));
create policy acquisition_channels_owner_insert on public.acquisition_channels for insert with check (exists (select 1 from public.restaurants r where r.id = acquisition_channels.restaurant_id and r.owner_id = auth.uid()));
create policy acquisition_channels_owner_update on public.acquisition_channels for update using (exists (select 1 from public.restaurants r where r.id = acquisition_channels.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = acquisition_channels.restaurant_id and r.owner_id = auth.uid()));
create policy acquisition_channels_owner_delete on public.acquisition_channels for delete using (exists (select 1 from public.restaurants r where r.id = acquisition_channels.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists audits_owner_select on public.audits;
drop policy if exists audits_owner_insert on public.audits;
drop policy if exists audits_owner_update on public.audits;
drop policy if exists audits_owner_delete on public.audits;
create policy audits_owner_select on public.audits for select using (exists (select 1 from public.restaurants r where r.id = audits.restaurant_id and r.owner_id = auth.uid()));
create policy audits_owner_insert on public.audits for insert with check (exists (select 1 from public.restaurants r where r.id = audits.restaurant_id and r.owner_id = auth.uid()));
create policy audits_owner_update on public.audits for update using (exists (select 1 from public.restaurants r where r.id = audits.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = audits.restaurant_id and r.owner_id = auth.uid()));
create policy audits_owner_delete on public.audits for delete using (exists (select 1 from public.restaurants r where r.id = audits.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists audit_findings_owner_select on public.audit_findings;
drop policy if exists audit_findings_owner_insert on public.audit_findings;
drop policy if exists audit_findings_owner_update on public.audit_findings;
drop policy if exists audit_findings_owner_delete on public.audit_findings;
create policy audit_findings_owner_select on public.audit_findings for select using (exists (select 1 from public.restaurants r where r.id = audit_findings.restaurant_id and r.owner_id = auth.uid()));
create policy audit_findings_owner_insert on public.audit_findings for insert with check (exists (select 1 from public.restaurants r where r.id = audit_findings.restaurant_id and r.owner_id = auth.uid()));
create policy audit_findings_owner_update on public.audit_findings for update using (exists (select 1 from public.restaurants r where r.id = audit_findings.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = audit_findings.restaurant_id and r.owner_id = auth.uid()));
create policy audit_findings_owner_delete on public.audit_findings for delete using (exists (select 1 from public.restaurants r where r.id = audit_findings.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists opportunities_owner_select on public.opportunities;
drop policy if exists opportunities_owner_insert on public.opportunities;
drop policy if exists opportunities_owner_update on public.opportunities;
drop policy if exists opportunities_owner_delete on public.opportunities;
create policy opportunities_owner_select on public.opportunities for select using (exists (select 1 from public.restaurants r where r.id = opportunities.restaurant_id and r.owner_id = auth.uid()));
create policy opportunities_owner_insert on public.opportunities for insert with check (exists (select 1 from public.restaurants r where r.id = opportunities.restaurant_id and r.owner_id = auth.uid()));
create policy opportunities_owner_update on public.opportunities for update using (exists (select 1 from public.restaurants r where r.id = opportunities.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = opportunities.restaurant_id and r.owner_id = auth.uid()));
create policy opportunities_owner_delete on public.opportunities for delete using (exists (select 1 from public.restaurants r where r.id = opportunities.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists actions_owner_select on public.actions;
drop policy if exists actions_owner_insert on public.actions;
drop policy if exists actions_owner_update on public.actions;
drop policy if exists actions_owner_delete on public.actions;
create policy actions_owner_select on public.actions for select using (exists (select 1 from public.restaurants r where r.id = actions.restaurant_id and r.owner_id = auth.uid()));
create policy actions_owner_insert on public.actions for insert with check (exists (select 1 from public.restaurants r where r.id = actions.restaurant_id and r.owner_id = auth.uid()));
create policy actions_owner_update on public.actions for update using (exists (select 1 from public.restaurants r where r.id = actions.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = actions.restaurant_id and r.owner_id = auth.uid()));
create policy actions_owner_delete on public.actions for delete using (exists (select 1 from public.restaurants r where r.id = actions.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists competitors_owner_select on public.competitors;
drop policy if exists competitors_owner_insert on public.competitors;
drop policy if exists competitors_owner_update on public.competitors;
drop policy if exists competitors_owner_delete on public.competitors;
create policy competitors_owner_select on public.competitors for select using (exists (select 1 from public.restaurants r where r.id = competitors.restaurant_id and r.owner_id = auth.uid()));
create policy competitors_owner_insert on public.competitors for insert with check (exists (select 1 from public.restaurants r where r.id = competitors.restaurant_id and r.owner_id = auth.uid()));
create policy competitors_owner_update on public.competitors for update using (exists (select 1 from public.restaurants r where r.id = competitors.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = competitors.restaurant_id and r.owner_id = auth.uid()));
create policy competitors_owner_delete on public.competitors for delete using (exists (select 1 from public.restaurants r where r.id = competitors.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists competitor_changes_owner_select on public.competitor_changes;
drop policy if exists competitor_changes_owner_insert on public.competitor_changes;
drop policy if exists competitor_changes_owner_update on public.competitor_changes;
drop policy if exists competitor_changes_owner_delete on public.competitor_changes;
create policy competitor_changes_owner_select on public.competitor_changes for select using (exists (select 1 from public.restaurants r where r.id = competitor_changes.restaurant_id and r.owner_id = auth.uid()));
create policy competitor_changes_owner_insert on public.competitor_changes for insert with check (exists (select 1 from public.restaurants r where r.id = competitor_changes.restaurant_id and r.owner_id = auth.uid()));
create policy competitor_changes_owner_update on public.competitor_changes for update using (exists (select 1 from public.restaurants r where r.id = competitor_changes.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = competitor_changes.restaurant_id and r.owner_id = auth.uid()));
create policy competitor_changes_owner_delete on public.competitor_changes for delete using (exists (select 1 from public.restaurants r where r.id = competitor_changes.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists content_opportunities_owner_select on public.content_opportunities;
drop policy if exists content_opportunities_owner_insert on public.content_opportunities;
drop policy if exists content_opportunities_owner_update on public.content_opportunities;
drop policy if exists content_opportunities_owner_delete on public.content_opportunities;
create policy content_opportunities_owner_select on public.content_opportunities for select using (exists (select 1 from public.restaurants r where r.id = content_opportunities.restaurant_id and r.owner_id = auth.uid()));
create policy content_opportunities_owner_insert on public.content_opportunities for insert with check (exists (select 1 from public.restaurants r where r.id = content_opportunities.restaurant_id and r.owner_id = auth.uid()));
create policy content_opportunities_owner_update on public.content_opportunities for update using (exists (select 1 from public.restaurants r where r.id = content_opportunities.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = content_opportunities.restaurant_id and r.owner_id = auth.uid()));
create policy content_opportunities_owner_delete on public.content_opportunities for delete using (exists (select 1 from public.restaurants r where r.id = content_opportunities.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists content_ideas_owner_select on public.content_ideas;
drop policy if exists content_ideas_owner_insert on public.content_ideas;
drop policy if exists content_ideas_owner_update on public.content_ideas;
drop policy if exists content_ideas_owner_delete on public.content_ideas;
create policy content_ideas_owner_select on public.content_ideas for select using (exists (select 1 from public.restaurants r where r.id = content_ideas.restaurant_id and r.owner_id = auth.uid()));
create policy content_ideas_owner_insert on public.content_ideas for insert with check (exists (select 1 from public.restaurants r where r.id = content_ideas.restaurant_id and r.owner_id = auth.uid()));
create policy content_ideas_owner_update on public.content_ideas for update using (exists (select 1 from public.restaurants r where r.id = content_ideas.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = content_ideas.restaurant_id and r.owner_id = auth.uid()));
create policy content_ideas_owner_delete on public.content_ideas for delete using (exists (select 1 from public.restaurants r where r.id = content_ideas.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists prospects_owner_select on public.prospects;
drop policy if exists prospects_owner_insert on public.prospects;
drop policy if exists prospects_owner_update on public.prospects;
drop policy if exists prospects_owner_delete on public.prospects;
create policy prospects_owner_select on public.prospects for select using (exists (select 1 from public.restaurants r where r.id = prospects.restaurant_id and r.owner_id = auth.uid()));
create policy prospects_owner_insert on public.prospects for insert with check (exists (select 1 from public.restaurants r where r.id = prospects.restaurant_id and r.owner_id = auth.uid()));
create policy prospects_owner_update on public.prospects for update using (exists (select 1 from public.restaurants r where r.id = prospects.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = prospects.restaurant_id and r.owner_id = auth.uid()));
create policy prospects_owner_delete on public.prospects for delete using (exists (select 1 from public.restaurants r where r.id = prospects.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists experiments_owner_select on public.experiments;
drop policy if exists experiments_owner_insert on public.experiments;
drop policy if exists experiments_owner_update on public.experiments;
drop policy if exists experiments_owner_delete on public.experiments;
create policy experiments_owner_select on public.experiments for select using (exists (select 1 from public.restaurants r where r.id = experiments.restaurant_id and r.owner_id = auth.uid()));
create policy experiments_owner_insert on public.experiments for insert with check (exists (select 1 from public.restaurants r where r.id = experiments.restaurant_id and r.owner_id = auth.uid()));
create policy experiments_owner_update on public.experiments for update using (exists (select 1 from public.restaurants r where r.id = experiments.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = experiments.restaurant_id and r.owner_id = auth.uid()));
create policy experiments_owner_delete on public.experiments for delete using (exists (select 1 from public.restaurants r where r.id = experiments.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists progress_snapshots_owner_select on public.progress_snapshots;
drop policy if exists progress_snapshots_owner_insert on public.progress_snapshots;
drop policy if exists progress_snapshots_owner_update on public.progress_snapshots;
drop policy if exists progress_snapshots_owner_delete on public.progress_snapshots;
create policy progress_snapshots_owner_select on public.progress_snapshots for select using (exists (select 1 from public.restaurants r where r.id = progress_snapshots.restaurant_id and r.owner_id = auth.uid()));
create policy progress_snapshots_owner_insert on public.progress_snapshots for insert with check (exists (select 1 from public.restaurants r where r.id = progress_snapshots.restaurant_id and r.owner_id = auth.uid()));
create policy progress_snapshots_owner_update on public.progress_snapshots for update using (exists (select 1 from public.restaurants r where r.id = progress_snapshots.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = progress_snapshots.restaurant_id and r.owner_id = auth.uid()));
create policy progress_snapshots_owner_delete on public.progress_snapshots for delete using (exists (select 1 from public.restaurants r where r.id = progress_snapshots.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists integrations_owner_select on public.integrations;
drop policy if exists integrations_owner_insert on public.integrations;
drop policy if exists integrations_owner_update on public.integrations;
drop policy if exists integrations_owner_delete on public.integrations;
create policy integrations_owner_select on public.integrations for select using (exists (select 1 from public.restaurants r where r.id = integrations.restaurant_id and r.owner_id = auth.uid()));
create policy integrations_owner_insert on public.integrations for insert with check (exists (select 1 from public.restaurants r where r.id = integrations.restaurant_id and r.owner_id = auth.uid()));
create policy integrations_owner_update on public.integrations for update using (exists (select 1 from public.restaurants r where r.id = integrations.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = integrations.restaurant_id and r.owner_id = auth.uid()));
create policy integrations_owner_delete on public.integrations for delete using (exists (select 1 from public.restaurants r where r.id = integrations.restaurant_id and r.owner_id = auth.uid()));

drop policy if exists action_impacts_owner_select on public.action_impacts;
drop policy if exists action_impacts_owner_insert on public.action_impacts;
drop policy if exists action_impacts_owner_update on public.action_impacts;
drop policy if exists action_impacts_owner_delete on public.action_impacts;
create policy action_impacts_owner_select on public.action_impacts for select using (exists (select 1 from public.restaurants r where r.id = action_impacts.restaurant_id and r.owner_id = auth.uid()));
create policy action_impacts_owner_insert on public.action_impacts for insert with check (exists (select 1 from public.restaurants r where r.id = action_impacts.restaurant_id and r.owner_id = auth.uid()));
create policy action_impacts_owner_update on public.action_impacts for update using (exists (select 1 from public.restaurants r where r.id = action_impacts.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = action_impacts.restaurant_id and r.owner_id = auth.uid()));
create policy action_impacts_owner_delete on public.action_impacts for delete using (exists (select 1 from public.restaurants r where r.id = action_impacts.restaurant_id and r.owner_id = auth.uid()));
