-- Encaissement atomique d’un bon cadeau (SELECT FOR UPDATE).
-- Ne jamais accepter restaurant_id depuis le client : le resto est dérivé de auth.uid().

create or replace function public.redeem_gift_voucher(
  p_amount_cents integer,
  p_code text default null,
  p_voucher_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_restaurant_id uuid;
  v_voucher public.gift_vouchers%rowtype;
  v_code_compact text;
  v_new_balance integer;
  v_new_status text;
  v_fully_used_at timestamptz;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  if p_amount_cents is null or p_amount_cents <= 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_amount');
  end if;

  select r.id
    into v_restaurant_id
  from public.restaurants r
  where r.owner_id = v_uid
  limit 1;

  if v_restaurant_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  v_code_compact := upper(regexp_replace(trim(coalesce(p_code, '')), '[\s-]+', '', 'g'));

  if p_voucher_id is not null then
    select *
      into v_voucher
    from public.gift_vouchers gv
    where gv.id = p_voucher_id
      and gv.restaurant_id = v_restaurant_id
    for update;
  elsif length(v_code_compact) > 0 then
    select *
      into v_voucher
    from public.gift_vouchers gv
    where gv.restaurant_id = v_restaurant_id
      and replace(upper(gv.code), '-', '') = v_code_compact
    for update;
  else
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_voucher.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_voucher.status = 'draft' then
    return jsonb_build_object('ok', false, 'error', 'draft');
  end if;

  if v_voucher.status = 'disabled' then
    return jsonb_build_object('ok', false, 'error', 'disabled');
  end if;

  if v_voucher.status = 'used' or v_voucher.remaining_amount_cents <= 0 then
    return jsonb_build_object('ok', false, 'error', 'used');
  end if;

  if v_voucher.status = 'expired'
     or (v_voucher.expires_at is not null and v_voucher.expires_at < now()) then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  if v_voucher.status is distinct from 'active' then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if p_amount_cents > v_voucher.remaining_amount_cents then
    return jsonb_build_object('ok', false, 'error', 'insufficient_balance');
  end if;

  v_new_balance := v_voucher.remaining_amount_cents - p_amount_cents;

  if v_new_balance = 0 then
    v_new_status := 'used';
    v_fully_used_at := now();
  else
    v_new_status := 'active';
    v_fully_used_at := v_voucher.fully_used_at;
  end if;

  update public.gift_vouchers
  set
    remaining_amount_cents = v_new_balance,
    status = v_new_status,
    fully_used_at = v_fully_used_at
  where id = v_voucher.id
    and restaurant_id = v_restaurant_id;

  insert into public.gift_voucher_transactions (
    voucher_id,
    restaurant_id,
    type,
    amount_cents,
    balance_before_cents,
    balance_after_cents,
    note,
    created_by
  )
  values (
    v_voucher.id,
    v_restaurant_id,
    'redemption',
    p_amount_cents,
    v_voucher.remaining_amount_cents,
    v_new_balance,
    'Utilisation',
    v_uid
  );

  return jsonb_build_object(
    'ok', true,
    'voucher_id', v_voucher.id,
    'restaurant_id', v_restaurant_id,
    'amount_cents', p_amount_cents,
    'balance_before_cents', v_voucher.remaining_amount_cents,
    'balance_after_cents', v_new_balance,
    'status', v_new_status
  );
end;
$$;

comment on function public.redeem_gift_voucher(integer, text, uuid) is
  'Encaissement atomique d’un bon cadeau (verrouillage de ligne, scoped à l’établissement du propriétaire).';

revoke all on function public.redeem_gift_voucher(integer, text, uuid) from public;
grant execute on function public.redeem_gift_voucher(integer, text, uuid) to authenticated;
