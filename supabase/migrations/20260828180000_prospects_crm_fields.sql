-- Sharpz Prospects: champs CRM réels, sans casser les lignes existantes.

alter table public.prospects
  add column if not exists prospect_type text not null default 'company',
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists source text,
  add column if not exists last_action text,
  add column if not exists contacted_at timestamptz,
  add column if not exists next_follow_up_at timestamptz;

update public.prospects
set status = case status
  when 'customer' then 'closed'
  when 'refused' then 'not_relevant'
  else status
end
where status in ('customer', 'refused');

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
      'closed'
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
