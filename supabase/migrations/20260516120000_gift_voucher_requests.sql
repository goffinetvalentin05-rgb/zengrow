-- Demandes de bons cadeaux depuis la page publique (prise de contact, pas e-commerce).

create type public.gift_voucher_request_status as enum (
  'new',
  'in_progress',
  'sent',
  'completed'
);

create table public.gift_voucher_requests (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  requester_first_name text not null,
  requester_last_name text not null,
  requester_email text not null,
  requester_phone text,
  amount_hint text,
  message text,
  beneficiary_name text,
  occasion text,
  status public.gift_voucher_request_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gift_voucher_requests_restaurant_id_created_at_idx
  on public.gift_voucher_requests (restaurant_id, created_at desc);

alter table public.gift_voucher_requests enable row level security;

create policy "gift_voucher_requests_select_own_restaurant"
  on public.gift_voucher_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.restaurants r
      where r.id = gift_voucher_requests.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "gift_voucher_requests_update_own_restaurant"
  on public.gift_voucher_requests
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.restaurants r
      where r.id = gift_voucher_requests.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.restaurants r
      where r.id = gift_voucher_requests.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

comment on table public.gift_voucher_requests is
  'Demandes visiteurs pour un bon cadeau ; traitement manuel côté restaurant.';

-- Insertion publique uniquement via RPC (security definer).

create or replace function public.submit_gift_voucher_request(
  p_slug text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_amount text,
  p_message text,
  p_beneficiary text,
  p_occasion text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rid uuid;
  v_id uuid;
  v_email text;
begin
  if p_slug is null or length(trim(p_slug)) < 1 then
    return null;
  end if;

  v_email := trim(lower(coalesce(p_email, '')));
  if length(v_email) < 5 or position('@' in v_email) < 2 then
    return null;
  end if;

  if p_first_name is null or length(trim(p_first_name)) < 1 then
    return null;
  end if;
  if p_last_name is null or length(trim(p_last_name)) < 1 then
    return null;
  end if;

  select id
    into v_rid
  from public.restaurants
  where slug = lower(trim(p_slug))
  limit 1;

  if v_rid is null then
    return null;
  end if;

  insert into public.gift_voucher_requests (
    restaurant_id,
    requester_first_name,
    requester_last_name,
    requester_email,
    requester_phone,
    amount_hint,
    message,
    beneficiary_name,
    occasion
  )
  values (
    v_rid,
    left(trim(p_first_name), 120),
    left(trim(p_last_name), 120),
    left(v_email, 320),
    nullif(left(trim(coalesce(p_phone, '')), 40), ''),
    nullif(left(trim(coalesce(p_amount, '')), 80), ''),
    nullif(left(trim(coalesce(p_message, '')), 2000), ''),
    nullif(left(trim(coalesce(p_beneficiary, '')), 200), ''),
    nullif(left(trim(coalesce(p_occasion, '')), 120), '')
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.submit_gift_voucher_request(
  text, text, text, text, text, text, text, text, text
) to anon, authenticated;

drop trigger if exists set_gift_voucher_requests_updated_at on public.gift_voucher_requests;
create trigger set_gift_voucher_requests_updated_at
  before update on public.gift_voucher_requests
  for each row execute function public.zengrow_set_updated_at();
