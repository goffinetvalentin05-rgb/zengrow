alter table public.restaurants
  add column if not exists reservation_confirmation_mode text not null default 'manual';

alter table public.restaurants
  drop constraint if exists restaurants_reservation_confirmation_mode_check;
alter table public.restaurants
  add constraint restaurants_reservation_confirmation_mode_check
  check (reservation_confirmation_mode in ('manual', 'automatic'));

alter table public.reservations
  drop constraint if exists reservations_status_check;

update public.reservations
set status = 'rejected'
where status = 'cancelled';

alter table public.reservations
  add constraint reservations_status_check
  check (status in ('pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'no-show'));
