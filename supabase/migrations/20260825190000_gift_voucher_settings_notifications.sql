-- Paramètres bons cadeaux (validité / montants CHF) + notifications in-app.
-- Idempotent : relançable si les colonnes, contraintes ou enums existent déjà.

alter table public.restaurant_settings
  add column if not exists gift_voucher_default_validity_months integer not null default 12,
  add column if not exists gift_voucher_suggested_amounts integer[] not null default '{50,100,150}',
  add column if not exists notify_gift_voucher_created boolean not null default true,
  add column if not exists notify_gift_voucher_request boolean not null default true,
  add column if not exists notify_gift_voucher_redeemed boolean not null default true,
  add column if not exists notify_gift_voucher_fully_used boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'restaurant_settings_gift_voucher_validity_months'
      and conrelid = 'public.restaurant_settings'::regclass
  ) then
    alter table public.restaurant_settings
      add constraint restaurant_settings_gift_voucher_validity_months
      check (gift_voucher_default_validity_months between 1 and 60);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'restaurant_settings_gift_voucher_suggested_amounts'
      and conrelid = 'public.restaurant_settings'::regclass
  ) then
    alter table public.restaurant_settings
      add constraint restaurant_settings_gift_voucher_suggested_amounts
      check (
        cardinality(gift_voucher_suggested_amounts) between 1 and 8
        and array_position(gift_voucher_suggested_amounts, null) is null
        and 1 <= all (gift_voucher_suggested_amounts)
        and 10000 >= all (gift_voucher_suggested_amounts)
      );
  end if;
end $$;

comment on column public.restaurant_settings.gift_voucher_default_validity_months is
  'Durée de validité proposée à la création d’un nouveau bon (mois). N’altère pas les bons existants.';
comment on column public.restaurant_settings.gift_voucher_suggested_amounts is
  'Montants CHF proposés à la création (dashboard) et sur la page publique. N’altère pas les bons existants.';

alter type public.notification_type add value if not exists 'gift_voucher_created';
alter type public.notification_type add value if not exists 'gift_voucher_request';
alter type public.notification_type add value if not exists 'gift_voucher_redeemed';
alter type public.notification_type add value if not exists 'gift_voucher_fully_used';
