-- Review automation: email only + private feedback pipeline

-- 1) Force review automation channel to email only.
update public.review_automation_settings
set channel = 'email'
where channel <> 'email';

alter table public.review_automation_settings
  drop constraint if exists review_automation_settings_channel_check;

alter table public.review_automation_settings
  add constraint review_automation_settings_channel_check
  check (channel in ('email'));

-- 2) Track review request send state directly on reservations.
alter table public.reservations
  add column if not exists review_sent boolean not null default false,
  add column if not exists review_sent_at timestamptz;

create index if not exists reservations_review_send_idx
on public.reservations (restaurant_id, status, review_sent, reservation_date, reservation_time);

-- 3) Store private feedback when rating is low.
create table if not exists public.customer_feedback (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  message text,
  created_at timestamptz not null default now(),
  constraint customer_feedback_reservation_unique unique (reservation_id)
);

create index if not exists customer_feedback_restaurant_idx
on public.customer_feedback (restaurant_id, created_at desc);

create index if not exists customer_feedback_reservation_idx
on public.customer_feedback (reservation_id);

alter table public.customer_feedback enable row level security;

drop policy if exists "customer_feedback_owner_select" on public.customer_feedback;
create policy "customer_feedback_owner_select"
on public.customer_feedback for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = customer_feedback.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "customer_feedback_public_insert" on public.customer_feedback;
create policy "customer_feedback_public_insert"
on public.customer_feedback for insert
with check (
  exists (
    select 1
    from public.reservations rs
    where rs.id = customer_feedback.reservation_id
      and rs.restaurant_id = customer_feedback.restaurant_id
      and rs.status = 'completed'
  )
);
