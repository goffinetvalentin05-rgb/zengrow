-- Outreach Prospects : profils sociaux + bibliothèque de scripts réutilisables.

alter table public.prospects
  add column if not exists linkedin_url text,
  add column if not exists instagram_url text;

create table if not exists public.prospect_scripts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  channel text not null,
  stage text not null,
  content text not null,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prospect_scripts_channel_chk
    check (channel in ('whatsapp', 'linkedin', 'instagram', 'email', 'phone')),
  constraint prospect_scripts_stage_chk
    check (stage in ('first_contact', 'follow_up_1', 'follow_up_2', 'in_discussion', 'closing', 'custom'))
);

create index if not exists prospect_scripts_restaurant_channel_idx
  on public.prospect_scripts (restaurant_id, channel, stage);

create index if not exists prospect_scripts_restaurant_updated_idx
  on public.prospect_scripts (restaurant_id, updated_at desc);

drop trigger if exists prospect_scripts_set_updated_at on public.prospect_scripts;
create trigger prospect_scripts_set_updated_at
before update on public.prospect_scripts
for each row execute function public.sharpz_set_updated_at();

alter table public.prospect_scripts enable row level security;

drop policy if exists prospect_scripts_owner_select on public.prospect_scripts;
drop policy if exists prospect_scripts_owner_insert on public.prospect_scripts;
drop policy if exists prospect_scripts_owner_update on public.prospect_scripts;
drop policy if exists prospect_scripts_owner_delete on public.prospect_scripts;
create policy prospect_scripts_owner_select on public.prospect_scripts for select using (exists (select 1 from public.restaurants r where r.id = prospect_scripts.restaurant_id and r.owner_id = auth.uid()));
create policy prospect_scripts_owner_insert on public.prospect_scripts for insert with check (exists (select 1 from public.restaurants r where r.id = prospect_scripts.restaurant_id and r.owner_id = auth.uid()));
create policy prospect_scripts_owner_update on public.prospect_scripts for update using (exists (select 1 from public.restaurants r where r.id = prospect_scripts.restaurant_id and r.owner_id = auth.uid())) with check (exists (select 1 from public.restaurants r where r.id = prospect_scripts.restaurant_id and r.owner_id = auth.uid()));
create policy prospect_scripts_owner_delete on public.prospect_scripts for delete using (exists (select 1 from public.restaurants r where r.id = prospect_scripts.restaurant_id and r.owner_id = auth.uid()));
