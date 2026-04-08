-- Liens d'avis : token opaque par e-mail (Moyen / À améliorer), plus prédictible que l'ID réservation seul.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'feedback_initial_response') then
    create type public.feedback_initial_response as enum ('moyen', 'a_ameliorer');
  end if;
end$$;

drop index if exists public.feedbacks_unique_reservation_id;

alter table public.feedbacks
  add column if not exists token text,
  add column if not exists initial_response public.feedback_initial_response,
  add column if not exists responded_at timestamptz;

create unique index if not exists feedbacks_token_unique
on public.feedbacks (token)
where token is not null;

alter table public.feedbacks
  drop constraint if exists feedbacks_rating_check;

alter table public.feedbacks
  alter column rating drop not null;

alter table public.feedbacks
  alter column message drop not null;

alter table public.feedbacks
  add constraint feedbacks_rating_check
  check (rating is null or (rating >= 1 and rating <= 5));

-- Lignes déjà complétées : considérées comme répondues
update public.feedbacks
set responded_at = coalesce(responded_at, created_at)
where rating is not null and message is not null and responded_at is null;

-- Cohérence : si on a une note sans message (anciennes données), compléter responded_at
update public.feedbacks
set responded_at = coalesce(responded_at, created_at)
where rating is not null and responded_at is null;

-- Les insertions « invitation » (note et message nulls) passent par le service role uniquement.
drop policy if exists "allow_public_feedback_submission" on public.feedbacks;
create policy "allow_public_feedback_submission"
on public.feedbacks for insert
to anon
with check (
  rating is not null
  and message is not null
  and length(trim(message)) > 0
  and exists (
    select 1
    from public.reservations rs
    where rs.id = feedbacks.reservation_id
      and rs.restaurant_id = feedbacks.restaurant_id
      and rs.status = 'completed'
  )
);
