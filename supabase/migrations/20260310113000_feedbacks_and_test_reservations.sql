alter table public.reservations
  add column if not exists is_test boolean not null default false;

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists feedbacks_restaurant_idx
on public.feedbacks (restaurant_id, created_at desc);

create index if not exists feedbacks_reservation_idx
on public.feedbacks (reservation_id);

alter table public.feedbacks enable row level security;

drop policy if exists "feedbacks_owner_select" on public.feedbacks;
create policy "feedbacks_owner_select"
on public.feedbacks for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = feedbacks.restaurant_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists "allow_public_feedback_submission" on public.feedbacks;
create policy "allow_public_feedback_submission"
on public.feedbacks for insert
to anon
with check (true);
