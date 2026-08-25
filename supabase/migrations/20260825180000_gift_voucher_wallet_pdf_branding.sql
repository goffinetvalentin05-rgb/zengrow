-- Personnalisation des bons (PDF / Wallet) + PassKit Web Service.

alter table public.restaurant_settings
  add column if not exists gift_voucher_display_name text,
  add column if not exists gift_voucher_offer_title text,
  add column if not exists gift_voucher_accent_color text,
  add column if not exists gift_voucher_cover_url text,
  add column if not exists gift_voucher_terms text,
  add column if not exists gift_voucher_footer text,
  add column if not exists gift_voucher_include_buyer_on_pdf boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'restaurant_settings_gift_voucher_accent_color_hex'
      and conrelid = 'public.restaurant_settings'::regclass
  ) then
    alter table public.restaurant_settings
      add constraint restaurant_settings_gift_voucher_accent_color_hex
      check (
        gift_voucher_accent_color is null
        or gift_voucher_accent_color ~ '^#[0-9A-Fa-f]{6}$'
      );
  end if;
end $$;

comment on column public.restaurant_settings.gift_voucher_display_name is
  'Nom affiché sur le PDF et le pass Apple Wallet. Repli : public_display_name puis name.';
comment on column public.restaurant_settings.gift_voucher_cover_url is
  'Image de couverture du bon. Repli : cover_image_url de la page publique.';
comment on column public.restaurant_settings.gift_voucher_terms is
  'Conditions d’utilisation imprimées sur le PDF et au dos du pass.';

create table if not exists public.gift_voucher_wallet_passes (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null unique references public.gift_vouchers(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  serial_number text not null unique,
  authentication_token text not null,
  last_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint gift_voucher_wallet_passes_auth_len check (char_length(authentication_token) >= 16)
);

create table if not exists public.gift_voucher_wallet_devices (
  id uuid primary key default gen_random_uuid(),
  pass_id uuid not null references public.gift_voucher_wallet_passes(id) on delete cascade,
  device_library_identifier text not null,
  push_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gift_voucher_wallet_devices_unique unique (pass_id, device_library_identifier)
);

create index if not exists gift_voucher_wallet_devices_device_idx
  on public.gift_voucher_wallet_devices (device_library_identifier);

create index if not exists gift_voucher_wallet_passes_restaurant_idx
  on public.gift_voucher_wallet_passes (restaurant_id);

comment on table public.gift_voucher_wallet_passes is
  'Pass Apple Wallet : serialNumber stable (voucher id) et authenticationToken. Accès service_role uniquement.';

alter table public.gift_voucher_wallet_passes enable row level security;
alter table public.gift_voucher_wallet_devices enable row level security;

revoke all on table public.gift_voucher_wallet_passes from public, anon, authenticated;
revoke all on table public.gift_voucher_wallet_devices from public, anon, authenticated;
grant all on table public.gift_voucher_wallet_passes to service_role;
grant all on table public.gift_voucher_wallet_devices to service_role;
