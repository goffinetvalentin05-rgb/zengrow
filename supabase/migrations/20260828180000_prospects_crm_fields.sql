-- Sharpz Prospects: champs CRM réels, sans casser les lignes existantes.
-- Compatible avec des données déjà en statuts pipeline (follow_up_*, customer, …).

alter table public.prospects
  add column if not exists prospect_type text not null default 'company',
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists source text,
  add column if not exists last_action text,
  add column if not exists contacted_at timestamptz,
  add column if not exists next_follow_up_at timestamptz;

-- Normaliser uniquement les libellés legacy exclus (pas les statuts pipeline déjà en prod).
update public.prospects
set status = case status
  when 'refused' then 'not_relevant'
  else status
end
where status = 'refused';

-- Tout statut inconnu → to_contact (évite 23514 sur données de test / anciennes).
update public.prospects
set status = 'to_contact'
where status is null
   or status not in (
     -- pipeline final (20260828200000)
     'to_contact',
     'follow_up_1',
     'follow_up_2',
     'in_discussion',
     'qualified',
     'customer',
     'closed',
     -- intermediaires legacy (cette migration / avant pipeline)
     'new',
     'contacted',
     'followed_up',
     'replied',
     'not_relevant'
   );

alter table public.prospects
  drop constraint if exists prospects_status_chk;

alter table public.prospects
  add constraint prospects_status_chk
  check (
    status in (
      'new',
      'to_contact',
      'contacted',
      'followed_up',
      'replied',
      'qualified',
      'not_relevant',
      'closed',
      'follow_up_1',
      'follow_up_2',
      'in_discussion',
      'customer'
    )
  );

alter table public.prospects
  drop constraint if exists prospects_type_chk;

alter table public.prospects
  add constraint prospects_type_chk
  check (prospect_type in ('company', 'individual'));

create index if not exists prospects_restaurant_status_idx
  on public.prospects (restaurant_id, status);

create index if not exists prospects_restaurant_follow_up_idx
  on public.prospects (restaurant_id, next_follow_up_at)
  where next_follow_up_at is not null;
