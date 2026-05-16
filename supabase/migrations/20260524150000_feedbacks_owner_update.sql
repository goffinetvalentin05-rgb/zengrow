-- Permet au restaurateur de marquer lu/non lu (read_at) et d'éditer la note interne.

drop policy if exists "feedbacks_owner_update" on public.feedbacks;

create policy "feedbacks_owner_update"
on public.feedbacks for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = feedbacks.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = feedbacks.restaurant_id
      and r.owner_id = auth.uid()
  )
);
