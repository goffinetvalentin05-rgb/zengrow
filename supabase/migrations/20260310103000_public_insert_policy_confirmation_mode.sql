drop policy if exists "reservations_public_insert_from_link" on public.reservations;

create policy "reservations_public_insert_from_link"
on public.reservations for insert
with check (
  source = 'public_link'
  and exists (
    select 1
    from public.restaurants r
    where r.id = reservations.restaurant_id
      and (
        (r.reservation_confirmation_mode = 'manual' and reservations.status = 'pending')
        or (r.reservation_confirmation_mode = 'automatic' and reservations.status = 'confirmed')
      )
  )
);
