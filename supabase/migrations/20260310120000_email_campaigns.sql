create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  subject text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists email_campaigns_restaurant_id_idx
on public.email_campaigns (restaurant_id);

create index if not exists email_campaigns_created_at_idx
on public.email_campaigns (created_at desc);

alter table public.email_campaigns enable row level security;

drop policy if exists "email_campaigns_owner_select" on public.email_campaigns;
create policy "email_campaigns_owner_select"
on public.email_campaigns for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = email_campaigns.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "email_campaigns_owner_insert" on public.email_campaigns;
create policy "email_campaigns_owner_insert"
on public.email_campaigns for insert
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = email_campaigns.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "email_campaigns_owner_update" on public.email_campaigns;
create policy "email_campaigns_owner_update"
on public.email_campaigns for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = email_campaigns.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = email_campaigns.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "email_campaigns_owner_delete" on public.email_campaigns;
create policy "email_campaigns_owner_delete"
on public.email_campaigns for delete
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = email_campaigns.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create table if not exists public.email_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.email_campaigns(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  email text not null,
  sent_at timestamptz not null default now()
);

create index if not exists email_campaign_recipients_campaign_id_idx
on public.email_campaign_recipients (campaign_id);

create index if not exists email_campaign_recipients_customer_id_idx
on public.email_campaign_recipients (customer_id);

create unique index if not exists email_campaign_recipients_unique_campaign_email
on public.email_campaign_recipients (campaign_id, lower(email));

alter table public.email_campaign_recipients enable row level security;

drop policy if exists "email_campaign_recipients_owner_select" on public.email_campaign_recipients;
create policy "email_campaign_recipients_owner_select"
on public.email_campaign_recipients for select
using (
  exists (
    select 1
    from public.email_campaigns ec
    join public.restaurants r on r.id = ec.restaurant_id
    where ec.id = email_campaign_recipients.campaign_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "email_campaign_recipients_owner_insert" on public.email_campaign_recipients;
create policy "email_campaign_recipients_owner_insert"
on public.email_campaign_recipients for insert
with check (
  exists (
    select 1
    from public.email_campaigns ec
    join public.restaurants r on r.id = ec.restaurant_id
    where ec.id = email_campaign_recipients.campaign_id
      and r.owner_id = auth.uid()
  )
);
