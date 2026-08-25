-- Catalogue d’offres (modèles) vs bons émis (exemplaires).
-- Montants financiers en centimes. Compatible avec les bons existants (offer_id nullable).

alter table public.restaurant_settings
  add column if not exists gift_voucher_allow_free_amount boolean not null default true;

comment on column public.restaurant_settings.gift_voucher_allow_free_amount is
  'Si vrai, le commerçant peut encore émettre un bon à montant libre, hors catalogue d’offres.';

create table if not exists public.gift_voucher_offers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  title text not null,
  short_description text,
  detailed_description text,
  image_url text,
  kind text not null,
  sale_price_cents integer not null,
  face_value_cents integer,
  experience_label text,
  party_size integer,
  validity_months integer not null default 12,
  terms text,
  sort_index integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gift_voucher_offers_kind_check check (kind in ('monetary', 'experience')),
  constraint gift_voucher_offers_status_check check (status in ('active', 'inactive', 'archived')),
  constraint gift_voucher_offers_sale_price_check check (sale_price_cents >= 0 and sale_price_cents <= 1000000),
  constraint gift_voucher_offers_face_value_check check (
    face_value_cents is null or (face_value_cents > 0 and face_value_cents <= 1000000)
  ),
  constraint gift_voucher_offers_monetary_value_check check (
    kind <> 'monetary' or (face_value_cents is not null and face_value_cents > 0)
  ),
  constraint gift_voucher_offers_party_size_check check (party_size is null or party_size between 1 and 50),
  constraint gift_voucher_offers_validity_check check (validity_months between 1 and 60),
  constraint gift_voucher_offers_title_check check (char_length(trim(title)) between 1 and 120)
);

create index if not exists gift_voucher_offers_restaurant_sort_idx
  on public.gift_voucher_offers (restaurant_id, sort_index, created_at);

create index if not exists gift_voucher_offers_restaurant_status_idx
  on public.gift_voucher_offers (restaurant_id, status);

drop trigger if exists set_gift_voucher_offers_updated_at on public.gift_voucher_offers;
create trigger set_gift_voucher_offers_updated_at
  before update on public.gift_voucher_offers
  for each row execute function public.zengrow_set_updated_at();

comment on table public.gift_voucher_offers is
  'Modèles d’offres de bons cadeaux (catalogue). Distinct des exemplaires émis dans gift_vouchers.';

alter table public.gift_vouchers
  add column if not exists offer_id uuid references public.gift_voucher_offers (id) on delete set null,
  add column if not exists offer_kind text not null default 'monetary',
  add column if not exists offer_title_snapshot text,
  add column if not exists offer_description_snapshot text,
  add column if not exists offer_image_url_snapshot text,
  add column if not exists offer_terms_snapshot text,
  add column if not exists offer_experience_label_snapshot text,
  add column if not exists offer_party_size_snapshot integer,
  add column if not exists sale_price_cents integer;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'gift_vouchers_offer_kind_check'
      and conrelid = 'public.gift_vouchers'::regclass
  ) then
    alter table public.gift_vouchers
      add constraint gift_vouchers_offer_kind_check
      check (offer_kind in ('monetary', 'experience'));
  end if;
end $$;

create index if not exists gift_vouchers_offer_id_idx
  on public.gift_vouchers (offer_id)
  where offer_id is not null;

comment on column public.gift_vouchers.offer_id is
  'Offre d’origine, nullable pour les bons historiques et le montant libre.';
comment on column public.gift_vouchers.offer_kind is
  'Snapshot du type d’offre (monetary | experience). Les bons existants restent monetary.';
comment on column public.gift_vouchers.offer_title_snapshot is
  'Titre commercial figé à l’émission. Survivra à une modification ou archive de l’offre.';
comment on column public.gift_vouchers.offer_image_url_snapshot is
  'Image de l’offre figée à l’émission.';

alter table public.gift_voucher_requests
  add column if not exists offer_id uuid references public.gift_voucher_offers (id) on delete set null;

alter table public.gift_voucher_offers enable row level security;

drop policy if exists gift_voucher_offers_owner_select on public.gift_voucher_offers;
create policy gift_voucher_offers_owner_select
  on public.gift_voucher_offers
  for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = gift_voucher_offers.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

drop policy if exists gift_voucher_offers_public_select_active on public.gift_voucher_offers;
create policy gift_voucher_offers_public_select_active
  on public.gift_voucher_offers
  for select
  to anon, authenticated
  using (status = 'active');

drop policy if exists gift_voucher_offers_owner_insert on public.gift_voucher_offers;
create policy gift_voucher_offers_owner_insert
  on public.gift_voucher_offers
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = gift_voucher_offers.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

drop policy if exists gift_voucher_offers_owner_update on public.gift_voucher_offers;
create policy gift_voucher_offers_owner_update
  on public.gift_voucher_offers
  for update
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = gift_voucher_offers.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = gift_voucher_offers.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

-- PostgreSQL n’autorise pas CREATE OR REPLACE si le type de retour change.
drop function if exists public.get_gift_voucher_by_public_token(text);

-- Lecture publique étendue : snapshots d’offre, sans données sensibles.
create or replace function public.get_gift_voucher_by_public_token(p_token text)
returns table (
  code text,
  status text,
  initial_amount_cents integer,
  remaining_amount_cents integer,
  currency text,
  expires_at timestamptz,
  recipient_name text,
  restaurant_name text,
  restaurant_logo_url text,
  offer_kind text,
  offer_title text,
  offer_description text,
  offer_image_url text,
  offer_experience_label text,
  offer_party_size integer,
  message text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_token text;
begin
  v_token := lower(trim(coalesce(p_token, '')));
  if v_token !~ '^[0-9a-f]{64}$' then
    return;
  end if;

  return query
  select
    gv.code,
    gv.status,
    gv.initial_amount_cents,
    gv.remaining_amount_cents,
    gv.currency,
    gv.expires_at,
    gv.recipient_name,
    coalesce(nullif(trim(r.public_display_name), ''), r.name)::text as restaurant_name,
    coalesce(nullif(trim(rs.logo_url), ''), r.logo_url)::text as restaurant_logo_url,
    gv.offer_kind,
    gv.offer_title_snapshot,
    gv.offer_description_snapshot,
    gv.offer_image_url_snapshot,
    gv.offer_experience_label_snapshot,
    gv.offer_party_size_snapshot,
    gv.message
  from public.gift_vouchers gv
  inner join public.restaurants r on r.id = gv.restaurant_id
  left join public.restaurant_settings rs on rs.restaurant_id = r.id
  where gv.public_token = v_token
  limit 1;
end;
$$;

comment on function public.get_gift_voucher_by_public_token(text) is
  'Lecture publique limitée d’un bon via token opaque, y compris le snapshot d’offre. Aucune redemption.';

revoke all on function public.get_gift_voucher_by_public_token(text) from public;
grant execute on function public.get_gift_voucher_by_public_token(text) to anon, authenticated;

drop function if exists public.submit_gift_voucher_request(text, text, text, text, text, text, text, text, text);
drop function if exists public.submit_gift_voucher_request(text, text, text, text, text, text, text, text, text, uuid);

create or replace function public.submit_gift_voucher_request(
  p_slug text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_amount text,
  p_message text,
  p_beneficiary text,
  p_occasion text,
  p_offer_id uuid default null
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
  v_offer_id uuid;
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

  v_offer_id := null;
  if p_offer_id is not null then
    select o.id
      into v_offer_id
    from public.gift_voucher_offers o
    where o.id = p_offer_id
      and o.restaurant_id = v_rid
      and o.status = 'active'
    limit 1;
    if v_offer_id is null then
      return null;
    end if;
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
    occasion,
    offer_id
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
    nullif(left(trim(coalesce(p_occasion, '')), 120), ''),
    v_offer_id
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.submit_gift_voucher_request(
  text, text, text, text, text, text, text, text, text, uuid
) to anon, authenticated;
