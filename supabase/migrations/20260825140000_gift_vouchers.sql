-- Bons cadeaux (émission manuelle dashboard). Stripe / QR / Wallet / PDF plus tard.

create table public.gift_vouchers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  buyer_customer_id uuid references public.customers (id) on delete set null,
  code text not null,
  type text not null,
  status text not null default 'active',
  initial_amount_cents integer not null,
  remaining_amount_cents integer not null,
  currency text not null default 'CHF',
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  recipient_name text,
  recipient_email text,
  message text,
  expires_at timestamptz,
  issued_at timestamptz not null default now(),
  fully_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  constraint gift_vouchers_code_unique unique (code),
  constraint gift_vouchers_type_check check (type in ('digital', 'paper')),
  constraint gift_vouchers_status_check check (status in ('draft', 'active', 'used', 'expired', 'disabled')),
  constraint gift_vouchers_initial_amount_check check (initial_amount_cents > 0),
  constraint gift_vouchers_remaining_amount_check check (
    remaining_amount_cents >= 0
    and remaining_amount_cents <= initial_amount_cents
  )
);

create table public.gift_voucher_transactions (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null references public.gift_vouchers (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  type text not null,
  amount_cents integer,
  balance_before_cents integer,
  balance_after_cents integer,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint gift_voucher_transactions_type_check check (
    type in ('issued', 'redemption', 'adjustment', 'refund', 'disabled', 'reactivated')
  )
);

create index gift_vouchers_restaurant_id_idx
  on public.gift_vouchers (restaurant_id);

create index gift_vouchers_restaurant_status_idx
  on public.gift_vouchers (restaurant_id, status);

create index gift_vouchers_restaurant_type_idx
  on public.gift_vouchers (restaurant_id, type);

create index gift_vouchers_buyer_email_idx
  on public.gift_vouchers (restaurant_id, lower(buyer_email))
  where buyer_email is not null;

create index gift_vouchers_issued_at_idx
  on public.gift_vouchers (restaurant_id, issued_at desc);

create index gift_vouchers_buyer_customer_id_idx
  on public.gift_vouchers (buyer_customer_id)
  where buyer_customer_id is not null;

create index gift_voucher_transactions_voucher_id_idx
  on public.gift_voucher_transactions (voucher_id, created_at);

create index gift_voucher_transactions_restaurant_id_idx
  on public.gift_voucher_transactions (restaurant_id, created_at desc);

comment on table public.gift_vouchers is
  'Bons cadeaux digitaux et papier, scoped par établissement.';

comment on table public.gift_voucher_transactions is
  'Historique d’émission, utilisation et ajustements des bons cadeaux.';

drop trigger if exists set_gift_vouchers_updated_at on public.gift_vouchers;
create trigger set_gift_vouchers_updated_at
  before update on public.gift_vouchers
  for each row execute function public.zengrow_set_updated_at();

alter table public.gift_vouchers enable row level security;
alter table public.gift_voucher_transactions enable row level security;

create policy "gift_vouchers_owner_select"
  on public.gift_vouchers
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.restaurants r
      where r.id = gift_vouchers.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "gift_vouchers_owner_insert"
  on public.gift_vouchers
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.restaurants r
      where r.id = gift_vouchers.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "gift_vouchers_owner_update"
  on public.gift_vouchers
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.restaurants r
      where r.id = gift_vouchers.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.restaurants r
      where r.id = gift_vouchers.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "gift_voucher_transactions_owner_select"
  on public.gift_voucher_transactions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.restaurants r
      where r.id = gift_voucher_transactions.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

create policy "gift_voucher_transactions_owner_insert"
  on public.gift_voucher_transactions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.restaurants r
      where r.id = gift_voucher_transactions.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );
