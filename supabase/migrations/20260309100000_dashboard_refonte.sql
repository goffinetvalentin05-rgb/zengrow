-- Mandatory for ZenGrow premium dashboard UI.

-- 1) Extend reservation statuses for operational workflows.
alter table public.reservations
drop constraint if exists reservations_status_check;

alter table public.reservations
add constraint reservations_status_check
check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no-show'));

-- Optional but recommended default for manual reservations:
-- alter table public.reservations alter column status set default 'pending';

-- 2) Add review automation configuration table.
create table if not exists public.review_automation_settings (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  is_enabled boolean not null default false,
  channel text not null default 'email',
  delay_minutes integer not null default 90,
  message_template text not null default 'Merci pour votre visite chez {{restaurant_name}}. Votre avis Google nous aide enormement : {{google_review_url}}',
  google_review_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_automation_settings_restaurant_unique unique (restaurant_id),
  constraint review_automation_settings_channel_check check (channel in ('email', 'whatsapp', 'sms')),
  constraint review_automation_delay_check check (delay_minutes > 0)
);

create index if not exists review_automation_settings_restaurant_id_idx
on public.review_automation_settings (restaurant_id);

alter table public.review_automation_settings enable row level security;

drop policy if exists "review_automation_owner_select" on public.review_automation_settings;
create policy "review_automation_owner_select"
on public.review_automation_settings for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = review_automation_settings.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "review_automation_owner_insert" on public.review_automation_settings;
create policy "review_automation_owner_insert"
on public.review_automation_settings for insert
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = review_automation_settings.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "review_automation_owner_update" on public.review_automation_settings;
create policy "review_automation_owner_update"
on public.review_automation_settings for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = review_automation_settings.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = review_automation_settings.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "review_automation_owner_delete" on public.review_automation_settings;
create policy "review_automation_owner_delete"
on public.review_automation_settings for delete
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = review_automation_settings.restaurant_id
      and r.owner_id = auth.uid()
  )
);

-- 3) Add settings fields used in premium settings page.
alter table public.restaurant_settings
add column if not exists reservation_alert_email text,
add column if not exists notify_email boolean default true,
add column if not exists notify_sms boolean default false,
add column if not exists accent_color text default '#3157d5',
add column if not exists logo_url text,
add column if not exists cover_image_url text;
