-- Empêche de falsifier statut / solde / date d’utilisation via le client (rôle authenticated).
-- redeem_gift_voucher et staff_update_gift_voucher (SECURITY DEFINER) restent autorisés.

create or replace function public.gift_vouchers_protect_redeem_fields()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if new.remaining_amount_cents is distinct from old.remaining_amount_cents
       or new.status is distinct from old.status
       or new.fully_used_at is distinct from old.fully_used_at
       or new.initial_amount_cents is distinct from old.initial_amount_cents
    then
      raise exception 'gift_voucher_status_must_use_rpc';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists gift_vouchers_protect_redeem_fields on public.gift_vouchers;
create trigger gift_vouchers_protect_redeem_fields
  before update on public.gift_vouchers
  for each row
  execute function public.gift_vouchers_protect_redeem_fields();

create or replace function public.staff_update_gift_voucher(
  p_voucher_id uuid,
  p_status text,
  p_remaining_amount_cents integer,
  p_fully_used_at timestamptz,
  p_tx_type text,
  p_amount_cents integer,
  p_balance_before_cents integer,
  p_balance_after_cents integer,
  p_note text
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
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  if p_status is null or p_status not in ('draft', 'active', 'used', 'expired', 'disabled') then
    return jsonb_build_object('ok', false, 'error', 'invalid_status');
  end if;

  if p_tx_type is null or p_tx_type not in ('issued', 'redemption', 'adjustment', 'refund', 'disabled', 'reactivated') then
    return jsonb_build_object('ok', false, 'error', 'invalid_type');
  end if;

  select r.id
    into v_restaurant_id
  from public.restaurants r
  where r.owner_id = v_uid
  limit 1;

  if v_restaurant_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  select *
    into v_voucher
  from public.gift_vouchers gv
  where gv.id = p_voucher_id
    and gv.restaurant_id = v_restaurant_id
  for update;

  if v_voucher.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  update public.gift_vouchers
  set
    status = p_status,
    remaining_amount_cents = p_remaining_amount_cents,
    fully_used_at = p_fully_used_at
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
    p_tx_type,
    p_amount_cents,
    p_balance_before_cents,
    p_balance_after_cents,
    p_note,
    v_uid
  );

  return jsonb_build_object('ok', true, 'voucher_id', v_voucher.id);
end;
$$;

comment on function public.staff_update_gift_voucher(uuid, text, integer, timestamptz, text, integer, integer, integer, text) is
  'Mise à jour staff (désactivation / réactivation / utilisation manuelle). Bypass du trigger client ; scoped au restaurant du propriétaire.';

revoke all on function public.staff_update_gift_voucher(uuid, text, integer, timestamptz, text, integer, integer, integer, text) from public;
grant execute on function public.staff_update_gift_voucher(uuid, text, integer, timestamptz, text, integer, integer, integer, text) to authenticated;
