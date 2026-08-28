-- P0.5 — Veille concurrents V1 (snapshots + changements structurés, pas de fake).

alter table public.competitors
  add column if not exists pricing_url text,
  add column if not exists notes text,
  add column if not exists active boolean not null default true;

comment on column public.competitors.url is 'Homepage / site public du concurrent.';
comment on column public.competitors.pricing_url is 'URL pricing publique connue — jamais inventée.';
comment on column public.competitors.active is 'false = veille désactivée (pas de cron).';

create table if not exists public.competitor_snapshots (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  competitor_id uuid not null,
  checked_at timestamptz not null default now(),
  homepage_url text,
  pricing_url text,
  title text,
  description text,
  hero text,
  cta text,
  pricing_text text,
  plans jsonb not null default '[]'::jsonb,
  content_hash text not null,
  source_urls jsonb not null default '[]'::jsonb,
  fetch_status text not null default 'ok'
    check (fetch_status in ('ok', 'unavailable', 'error')),
  error_message text,
  constraint competitor_snapshots_competitor_tenant_fkey
    foreign key (restaurant_id, competitor_id)
    references public.competitors (restaurant_id, id)
    on delete cascade
);

create index if not exists competitor_snapshots_competitor_checked_idx
  on public.competitor_snapshots (competitor_id, checked_at desc);

create index if not exists competitor_snapshots_restaurant_idx
  on public.competitor_snapshots (restaurant_id, checked_at desc);

alter table public.competitor_changes
  add column if not exists before_value text,
  add column if not exists after_value text,
  add column if not exists source_url text,
  add column if not exists confidence text,
  add column if not exists dedup_key text,
  add column if not exists metadata jsonb;

alter table public.competitor_changes
  drop constraint if exists competitor_changes_confidence_chk;

alter table public.competitor_changes
  add constraint competitor_changes_confidence_chk
  check (confidence is null or confidence in ('high', 'medium', 'low'));

create unique index if not exists competitor_changes_restaurant_dedup_uidx
  on public.competitor_changes (restaurant_id, dedup_key)
  where dedup_key is not null;

comment on column public.competitor_changes.dedup_key is
  'Anti-doublon: competitor + type + before + after (hash).';

alter table public.competitor_snapshots enable row level security;

drop policy if exists competitor_snapshots_owner_select on public.competitor_snapshots;
drop policy if exists competitor_snapshots_owner_insert on public.competitor_snapshots;
drop policy if exists competitor_snapshots_owner_update on public.competitor_snapshots;
drop policy if exists competitor_snapshots_owner_delete on public.competitor_snapshots;

create policy competitor_snapshots_owner_select on public.competitor_snapshots
  for select using (
    exists (select 1 from public.restaurants r where r.id = competitor_snapshots.restaurant_id and r.owner_id = auth.uid())
  );
create policy competitor_snapshots_owner_insert on public.competitor_snapshots
  for insert with check (
    exists (select 1 from public.restaurants r where r.id = competitor_snapshots.restaurant_id and r.owner_id = auth.uid())
  );
create policy competitor_snapshots_owner_update on public.competitor_snapshots
  for update using (
    exists (select 1 from public.restaurants r where r.id = competitor_snapshots.restaurant_id and r.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.restaurants r where r.id = competitor_snapshots.restaurant_id and r.owner_id = auth.uid())
  );
create policy competitor_snapshots_owner_delete on public.competitor_snapshots
  for delete using (
    exists (select 1 from public.restaurants r where r.id = competitor_snapshots.restaurant_id and r.owner_id = auth.uid())
  );
