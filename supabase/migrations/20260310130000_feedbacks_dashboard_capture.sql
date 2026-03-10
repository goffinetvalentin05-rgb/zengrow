alter table public.feedbacks
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists rating integer;

create unique index if not exists feedbacks_unique_reservation_id
on public.feedbacks (reservation_id);

insert into public.feedbacks (restaurant_id, reservation_id, rating, message, created_at)
select
  cf.restaurant_id,
  cf.reservation_id,
  cf.rating,
  coalesce(cf.message, ''),
  cf.created_at
from public.customer_feedback cf
on conflict (reservation_id) do nothing;

update public.feedbacks
set rating = 3
where rating is null;

update public.feedbacks f
set
  customer_name = coalesce(nullif(f.customer_name, ''), r.guest_name, 'Client'),
  customer_email = coalesce(nullif(f.customer_email, ''), r.guest_email)
from public.reservations r
where r.id = f.reservation_id;

alter table public.feedbacks
  alter column rating set not null;

alter table public.feedbacks
  drop constraint if exists feedbacks_rating_check;

alter table public.feedbacks
  add constraint feedbacks_rating_check check (rating between 1 and 5);

drop policy if exists "allow_public_feedback_submission" on public.feedbacks;
create policy "allow_public_feedback_submission"
on public.feedbacks for insert
to anon
with check (
  exists (
    select 1
    from public.reservations rs
    where rs.id = feedbacks.reservation_id
      and rs.restaurant_id = feedbacks.restaurant_id
      and rs.status = 'completed'
  )
);
