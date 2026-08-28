-- Pipeline WaveOne : statuts CRM + historique de contact.

update public.prospects
set status = case status
  when 'new' then 'to_contact'
  when 'contacted' then 'follow_up_1'
  when 'followed_up' then 'follow_up_2'
  when 'replied' then 'in_discussion'
  when 'not_relevant' then 'closed'
  else status
end;

alter table public.prospects
  drop constraint if exists prospects_status_chk;

alter table public.prospects
  add constraint prospects_status_chk
  check (
    status in (
      'to_contact',
      'follow_up_1',
      'follow_up_2',
      'in_discussion',
      'qualified',
      'customer',
      'closed'
    )
  );

create table if not exists public.prospect_events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  event_type text not null,
  detail text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint prospect_events_event_type_chk
    check (event_type in ('created', 'status_change', 'note', 'contact'))
);

create index if not exists prospect_events_prospect_created_idx
  on public.prospect_events (prospect_id, created_at desc);

create index if not exists prospect_events_restaurant_created_idx
  on public.prospect_events (restaurant_id, created_at desc);

alter table public.prospect_events enable row level security;

drop policy if exists prospect_events_owner_select on public.prospect_events;
drop policy if exists prospect_events_owner_insert on public.prospect_events;
create policy prospect_events_owner_select on public.prospect_events for select using (exists (select 1 from public.restaurants r where r.id = prospect_events.restaurant_id and r.owner_id = auth.uid()));
create policy prospect_events_owner_insert on public.prospect_events for insert with check (exists (select 1 from public.restaurants r where r.id = prospect_events.restaurant_id and r.owner_id = auth.uid()));
