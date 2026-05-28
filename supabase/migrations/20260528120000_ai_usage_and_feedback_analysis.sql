-- Journalisation des usages IA et analyse persistante des feedbacks privés.

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  feature text not null,
  model text,
  input_text text,
  output_text text,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_logs_restaurant_id_idx on public.ai_usage_logs (restaurant_id);
create index if not exists ai_usage_logs_created_at_idx on public.ai_usage_logs (created_at desc);
create index if not exists ai_usage_logs_feature_idx on public.ai_usage_logs (feature);

alter table public.feedbacks
  add column if not exists ai_analysis jsonb,
  add column if not exists ai_analysis_at timestamptz;

alter table public.ai_usage_logs enable row level security;

drop policy if exists "ai_usage_logs_owner_select" on public.ai_usage_logs;
create policy "ai_usage_logs_owner_select"
on public.ai_usage_logs for select
using (
  exists (
    select 1 from public.restaurants r
    where r.id = ai_usage_logs.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "ai_usage_logs_owner_insert" on public.ai_usage_logs;
create policy "ai_usage_logs_owner_insert"
on public.ai_usage_logs for insert
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = ai_usage_logs.restaurant_id
      and r.owner_id = auth.uid()
  )
);
