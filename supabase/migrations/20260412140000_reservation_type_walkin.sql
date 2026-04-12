-- Type de réservation : distinguer les walk-ins (sans réservation préalable) du flux standard.

alter table public.reservations
  add column if not exists reservation_type text not null default 'standard';

update public.reservations
set reservation_type = 'standard'
where reservation_type is null or trim(reservation_type) = '';

alter table public.reservations
  drop constraint if exists reservations_reservation_type_check;

alter table public.reservations
  add constraint reservations_reservation_type_check
  check (reservation_type in ('standard', 'walkin'));
