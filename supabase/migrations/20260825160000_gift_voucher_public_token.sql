-- Token public opaque pour QR / page /v/[token].
-- Ne pas exposer voucher_id, restaurant_id ni le code interne dans le QR.

create extension if not exists pgcrypto;

alter table public.gift_vouchers
  add column if not exists public_token text;

update public.gift_vouchers
set public_token = encode(gen_random_bytes(32), 'hex')
where public_token is null or length(trim(public_token)) = 0;

alter table public.gift_vouchers
  alter column public_token set default encode(gen_random_bytes(32), 'hex');

alter table public.gift_vouchers
  alter column public_token set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gift_vouchers_public_token_unique'
      and conrelid = 'public.gift_vouchers'::regclass
  ) then
    alter table public.gift_vouchers
      add constraint gift_vouchers_public_token_unique unique (public_token);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gift_vouchers_public_token_format'
      and conrelid = 'public.gift_vouchers'::regclass
  ) then
    alter table public.gift_vouchers
      add constraint gift_vouchers_public_token_format
      check (public_token ~ '^[0-9a-f]{64}$');
  end if;
end $$;

comment on column public.gift_vouchers.public_token is
  'Token opaque cryptographiquement aléatoire (32 bytes hex) pour QR et page publique /v/[token].';

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
  restaurant_logo_url text
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
    coalesce(nullif(trim(rs.logo_url), ''), r.logo_url)::text as restaurant_logo_url
  from public.gift_vouchers gv
  inner join public.restaurants r on r.id = gv.restaurant_id
  left join public.restaurant_settings rs on rs.restaurant_id = r.id
  where gv.public_token = v_token
  limit 1;
end;
$$;

comment on function public.get_gift_voucher_by_public_token(text) is
  'Lecture publique limitée d’un bon via token opaque. Aucune redemption.';

revoke all on function public.get_gift_voucher_by_public_token(text) from public;
grant execute on function public.get_gift_voucher_by_public_token(text) to anon, authenticated;
