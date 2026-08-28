-- Programme de fidélité (points), scoped par établissement.

alter table public.restaurant_settings
  add column if not exists loyalty_program_type text not null default 'points',
  add column if not exists loyalty_spend_amount_cents integer not null default 100,
  add column if not exists loyalty_points_per_spend integer not null default 1,
  add column if not exists loyalty_signup_bonus_points integer not null default 50,
  add column if not exists loyalty_points_expiration text not null default 'never';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'restaurant_settings_loyalty_program_type'
      and conrelid = 'public.restaurant_settings'::regclass
  ) then
    alter table public.restaurant_settings
      add constraint restaurant_settings_loyalty_program_type
      check (loyalty_program_type in ('points', 'stamps'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'restaurant_settings_loyalty_spend_amount'
      and conrelid = 'public.restaurant_settings'::regclass
  ) then
    alter table public.restaurant_settings
      add constraint restaurant_settings_loyalty_spend_amount
      check (loyalty_spend_amount_cents > 0 and loyalty_spend_amount_cents <= 1000000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'restaurant_settings_loyalty_points_per_spend'
      and conrelid = 'public.restaurant_settings'::regclass
  ) then
    alter table public.restaurant_settings
      add constraint restaurant_settings_loyalty_points_per_spend
      check (loyalty_points_per_spend > 0 and loyalty_points_per_spend <= 1000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'restaurant_settings_loyalty_signup_bonus'
      and conrelid = 'public.restaurant_settings'::regclass
  ) then
    alter table public.restaurant_settings
      add constraint restaurant_settings_loyalty_signup_bonus
      check (loyalty_signup_bonus_points >= 0 and loyalty_signup_bonus_points <= 100000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'restaurant_settings_loyalty_points_expiration'
      and conrelid = 'public.restaurant_settings'::regclass
  ) then
    alter table public.restaurant_settings
      add constraint restaurant_settings_loyalty_points_expiration
      check (loyalty_points_expiration in ('never', 'months_6', 'months_12'));
  end if;
end
$$;

comment on column public.restaurant_settings.loyalty_program_type is
  'Type de programme fidélité. MVP: points. stamps prévu plus tard.';
comment on column public.restaurant_settings.loyalty_spend_amount_cents is
  'Montant (centimes CHF) ouvrant droit à loyalty_points_per_spend points.';
comment on column public.restaurant_settings.loyalty_points_per_spend is
  'Points gagnés pour chaque palier loyalty_spend_amount_cents.';
comment on column public.restaurant_settings.loyalty_signup_bonus_points is
  'Points offerts à la création d’une carte. 0 = aucun bonus.';
comment on column public.restaurant_settings.loyalty_points_expiration is
  'Réglage d’expiration des points (never / 6 mois / 12 mois). Application automatique ultérieure.';

create table public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  card_code text not null,
  public_token text not null,
  points_balance integer not null default 0,
  status text not null default 'active',
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  constraint loyalty_cards_code_unique unique (card_code),
  constraint loyalty_cards_public_token_unique unique (public_token),
  constraint loyalty_cards_customer_unique unique (restaurant_id, customer_id),
  constraint loyalty_cards_status_check check (status in ('active', 'disabled')),
  constraint loyalty_cards_points_check check (points_balance >= 0),
  constraint loyalty_cards_token_format check (public_token ~ '^[0-9a-f]{64}$')
);

create table public.loyalty_rewards (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  title text not null,
  description text,
  points_required integer not null,
  active boolean not null default true,
  sort_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint loyalty_rewards_title_check check (char_length(trim(title)) > 0),
  constraint loyalty_rewards_points_check check (points_required > 0 and points_required <= 1000000)
);

create table public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  card_id uuid not null references public.loyalty_cards (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  type text not null,
  purchase_amount_cents integer,
  points_delta integer not null,
  balance_before integer not null,
  balance_after integer not null,
  reward_id uuid references public.loyalty_rewards (id) on delete set null,
  reward_title_snapshot text,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint loyalty_transactions_type_check check (
    type in ('signup_bonus', 'purchase', 'reward_redeemed', 'adjustment')
  ),
  constraint loyalty_transactions_purchase_amount_check check (
    purchase_amount_cents is null or purchase_amount_cents > 0
  )
);

create index loyalty_cards_restaurant_id_idx
  on public.loyalty_cards (restaurant_id, created_at desc);

create index loyalty_cards_restaurant_status_idx
  on public.loyalty_cards (restaurant_id, status);

create index loyalty_cards_customer_id_idx
  on public.loyalty_cards (customer_id);

create index loyalty_rewards_restaurant_id_idx
  on public.loyalty_rewards (restaurant_id, sort_index, points_required);

create index loyalty_transactions_card_id_idx
  on public.loyalty_transactions (card_id, created_at desc);

create index loyalty_transactions_restaurant_id_idx
  on public.loyalty_transactions (restaurant_id, created_at desc);

comment on table public.loyalty_cards is
  'Cartes de fidélité liées aux clients CRM, scoped par établissement.';
comment on table public.loyalty_rewards is
  'Paliers de récompenses du programme de fidélité.';
comment on table public.loyalty_transactions is
  'Historique des points (achats, bonus, utilisations de récompenses).';

drop trigger if exists set_loyalty_cards_updated_at on public.loyalty_cards;
create trigger set_loyalty_cards_updated_at
  before update on public.loyalty_cards
  for each row execute function public.zengrow_set_updated_at();

drop trigger if exists set_loyalty_rewards_updated_at on public.loyalty_rewards;
create trigger set_loyalty_rewards_updated_at
  before update on public.loyalty_rewards
  for each row execute function public.zengrow_set_updated_at();

alter table public.loyalty_cards enable row level security;
alter table public.loyalty_rewards enable row level security;
alter table public.loyalty_transactions enable row level security;

create policy "loyalty_cards_owner_select"
  on public.loyalty_cards
  for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = loyalty_cards.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "loyalty_cards_owner_insert"
  on public.loyalty_cards
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = loyalty_cards.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "loyalty_cards_owner_update"
  on public.loyalty_cards
  for update
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = loyalty_cards.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = loyalty_cards.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "loyalty_rewards_owner_select"
  on public.loyalty_rewards
  for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = loyalty_rewards.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "loyalty_rewards_owner_insert"
  on public.loyalty_rewards
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = loyalty_rewards.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "loyalty_rewards_owner_update"
  on public.loyalty_rewards
  for update
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = loyalty_rewards.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = loyalty_rewards.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "loyalty_rewards_owner_delete"
  on public.loyalty_rewards
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = loyalty_rewards.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "loyalty_transactions_owner_select"
  on public.loyalty_transactions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = loyalty_transactions.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "loyalty_transactions_owner_insert"
  on public.loyalty_transactions
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = loyalty_transactions.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create or replace function public.add_loyalty_purchase(
  p_card_id uuid,
  p_amount_cents integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_restaurant_id uuid;
  v_card public.loyalty_cards%rowtype;
  v_spend integer;
  v_per integer;
  v_points integer;
  v_new_balance integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  if p_card_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if p_amount_cents is null or p_amount_cents <= 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_amount');
  end if;

  select r.id into v_restaurant_id
  from public.restaurants r
  where r.owner_id = v_uid
  limit 1;

  if v_restaurant_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  select * into v_card
  from public.loyalty_cards lc
  where lc.id = p_card_id
    and lc.restaurant_id = v_restaurant_id
  for update;

  if v_card.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_card.status is distinct from 'active' then
    return jsonb_build_object('ok', false, 'error', 'disabled');
  end if;

  select
    coalesce(loyalty_spend_amount_cents, 100),
    coalesce(loyalty_points_per_spend, 1)
  into v_spend, v_per
  from public.restaurant_settings
  where restaurant_id = v_restaurant_id;

  if v_spend is null or v_spend <= 0 then v_spend := 100; end if;
  if v_per is null or v_per <= 0 then v_per := 1; end if;

  v_points := (p_amount_cents / v_spend) * v_per;
  v_new_balance := v_card.points_balance + v_points;

  update public.loyalty_cards
  set
    points_balance = v_new_balance,
    last_visit_at = now()
  where id = v_card.id
    and restaurant_id = v_restaurant_id;

  update public.customers
  set last_visit_at = now()
  where id = v_card.customer_id
    and restaurant_id = v_restaurant_id;

  insert into public.loyalty_transactions (
    restaurant_id,
    card_id,
    customer_id,
    type,
    purchase_amount_cents,
    points_delta,
    balance_before,
    balance_after,
    created_by
  )
  values (
    v_restaurant_id,
    v_card.id,
    v_card.customer_id,
    'purchase',
    p_amount_cents,
    v_points,
    v_card.points_balance,
    v_new_balance,
    v_uid
  );

  return jsonb_build_object(
    'ok', true,
    'card_id', v_card.id,
    'points_added', v_points,
    'balance_after', v_new_balance
  );
end;
$$;

create or replace function public.redeem_loyalty_reward(
  p_card_id uuid,
  p_reward_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_restaurant_id uuid;
  v_card public.loyalty_cards%rowtype;
  v_reward public.loyalty_rewards%rowtype;
  v_new_balance integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  if p_card_id is null or p_reward_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select r.id into v_restaurant_id
  from public.restaurants r
  where r.owner_id = v_uid
  limit 1;

  if v_restaurant_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  select * into v_card
  from public.loyalty_cards lc
  where lc.id = p_card_id
    and lc.restaurant_id = v_restaurant_id
  for update;

  if v_card.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_card.status is distinct from 'active' then
    return jsonb_build_object('ok', false, 'error', 'disabled');
  end if;

  select * into v_reward
  from public.loyalty_rewards lr
  where lr.id = p_reward_id
    and lr.restaurant_id = v_restaurant_id
  for update;

  if v_reward.id is null then
    return jsonb_build_object('ok', false, 'error', 'reward_not_found');
  end if;

  if v_reward.active is not true then
    return jsonb_build_object('ok', false, 'error', 'reward_inactive');
  end if;

  if v_card.points_balance < v_reward.points_required then
    return jsonb_build_object('ok', false, 'error', 'insufficient_points');
  end if;

  v_new_balance := v_card.points_balance - v_reward.points_required;

  update public.loyalty_cards
  set
    points_balance = v_new_balance,
    last_visit_at = now()
  where id = v_card.id
    and restaurant_id = v_restaurant_id;

  insert into public.loyalty_transactions (
    restaurant_id,
    card_id,
    customer_id,
    type,
    points_delta,
    balance_before,
    balance_after,
    reward_id,
    reward_title_snapshot,
    created_by
  )
  values (
    v_restaurant_id,
    v_card.id,
    v_card.customer_id,
    'reward_redeemed',
    -v_reward.points_required,
    v_card.points_balance,
    v_new_balance,
    v_reward.id,
    v_reward.title,
    v_uid
  );

  return jsonb_build_object(
    'ok', true,
    'card_id', v_card.id,
    'reward_id', v_reward.id,
    'points_spent', v_reward.points_required,
    'balance_after', v_new_balance
  );
end;
$$;

comment on function public.add_loyalty_purchase(uuid, integer) is
  'Ajoute des points après un achat (calcul selon les réglages, verrouillage de ligne).';
comment on function public.redeem_loyalty_reward(uuid, uuid) is
  'Utilise une récompense de façon atomique (déduit les points, empêche le double usage concurrent).';

revoke all on function public.add_loyalty_purchase(uuid, integer) from public;
grant execute on function public.add_loyalty_purchase(uuid, integer) to authenticated;

revoke all on function public.redeem_loyalty_reward(uuid, uuid) from public;
grant execute on function public.redeem_loyalty_reward(uuid, uuid) to authenticated;
