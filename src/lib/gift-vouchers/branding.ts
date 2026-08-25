import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_PRIMARY, contrastingTextColor, normalizeHexColor } from "@/src/lib/public-page/colors";
import { isGiftVoucherExpired } from "@/src/lib/gift-vouchers/redeem";
import { isPublicGiftVoucherStatus } from "@/src/lib/gift-vouchers/public-view";
import type { GiftVoucherStatus } from "@/src/lib/gift-vouchers/types";

export const DEFAULT_GIFT_VOUCHER_OFFER_TITLE = "Bon cadeau";
export const DEFAULT_GIFT_VOUCHER_TERMS =
  "Ce bon est utilisable en une ou plusieurs fois jusqu’à épuisement du solde, avant la date d’expiration. Il n’est ni échangeable ni remboursable, sauf obligation légale.";

export type GiftVoucherPresentation = {
  voucherId: string;
  restaurantId: string;
  code: string;
  status: GiftVoucherStatus;
  initialAmountCents: number;
  remainingAmountCents: number;
  currency: string;
  expiresAt: string | null;
  recipientName: string | null;
  buyerName: string | null;
  message: string | null;
  publicToken: string;
  offerTitle: string;
  restaurantName: string;
  restaurantLogoUrl: string | null;
  coverImageUrl: string | null;
  accentColor: string;
  foregroundColor: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  terms: string;
  footer: string | null;
  includeBuyerOnPdf: boolean;
};

export type GiftVoucherBrandingSettings = {
  displayName: string | null;
  offerTitle: string | null;
  accentColor: string | null;
  coverUrl: string | null;
  terms: string | null;
  footer: string | null;
  includeBuyerOnPdf: boolean;
};

type VoucherCoreRow = {
  id: string;
  restaurant_id: string;
  code: string;
  status: string;
  initial_amount_cents: number;
  remaining_amount_cents: number;
  currency: string | null;
  expires_at: string | null;
  recipient_name: string | null;
  buyer_name: string | null;
  message: string | null;
  public_token: string;
};

type RestaurantBrandingRow = {
  name: string | null;
  public_display_name: string | null;
  logo_url: string | null;
  public_accent_color: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  banner_url: string | null;
};

type SettingsBrandingRow = {
  logo_url: string | null;
  cover_image_url: string | null;
  accent_color: string | null;
  gift_voucher_display_name: string | null;
  gift_voucher_offer_title: string | null;
  gift_voucher_accent_color: string | null;
  gift_voucher_cover_url: string | null;
  gift_voucher_terms: string | null;
  gift_voucher_footer: string | null;
  gift_voucher_include_buyer_on_pdf: boolean | null;
};

const VOUCHER_CORE_SELECT =
  "id, restaurant_id, code, status, initial_amount_cents, remaining_amount_cents, currency, expires_at, recipient_name, buyer_name, message, public_token";

const RESTAURANT_BRANDING_SELECT =
  "name, public_display_name, logo_url, public_accent_color, phone, email, address, banner_url";

const SETTINGS_BASE_SELECT = "logo_url, cover_image_url, accent_color";
const SETTINGS_BRANDING_SELECT = `${SETTINGS_BASE_SELECT}, gift_voucher_display_name, gift_voucher_offer_title, gift_voucher_accent_color, gift_voucher_cover_url, gift_voucher_terms, gift_voucher_footer, gift_voucher_include_buyer_on_pdf`;

function firstNonEmpty(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

function contactFooter(restaurant: Partial<RestaurantBrandingRow> | null): string | null {
  const parts = [restaurant?.address?.trim(), restaurant?.phone?.trim(), restaurant?.email?.trim()].filter(
    Boolean,
  ) as string[];
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function resolveGiftVoucherPresentation(
  voucher: VoucherCoreRow,
  restaurant: RestaurantBrandingRow | null,
  settings: SettingsBrandingRow | null,
): GiftVoucherPresentation | null {
  if (!isPublicGiftVoucherStatus(voucher.status) || !voucher.public_token) return null;

  const accentColor = normalizeHexColor(
    firstNonEmpty(settings?.gift_voucher_accent_color, restaurant?.public_accent_color, settings?.accent_color) ??
      DEFAULT_PRIMARY,
    DEFAULT_PRIMARY,
  );

  return {
    voucherId: voucher.id,
    restaurantId: voucher.restaurant_id,
    code: voucher.code,
    status: voucher.status,
    initialAmountCents: voucher.initial_amount_cents,
    remainingAmountCents: voucher.remaining_amount_cents,
    currency: voucher.currency?.trim() || "CHF",
    expiresAt: voucher.expires_at,
    recipientName: voucher.recipient_name?.trim() || null,
    buyerName: voucher.buyer_name?.trim() || null,
    message: voucher.message?.trim() || null,
    publicToken: voucher.public_token,
    offerTitle:
      firstNonEmpty(settings?.gift_voucher_offer_title) ?? DEFAULT_GIFT_VOUCHER_OFFER_TITLE,
    restaurantName:
      firstNonEmpty(settings?.gift_voucher_display_name, restaurant?.public_display_name, restaurant?.name) ??
      "Établissement",
    restaurantLogoUrl: firstNonEmpty(settings?.logo_url, restaurant?.logo_url),
    coverImageUrl: firstNonEmpty(settings?.gift_voucher_cover_url, settings?.cover_image_url, restaurant?.banner_url),
    accentColor,
    foregroundColor: contrastingTextColor(accentColor),
    phone: restaurant?.phone?.trim() || null,
    email: restaurant?.email?.trim() || null,
    address: restaurant?.address?.trim() || null,
    terms: firstNonEmpty(settings?.gift_voucher_terms) ?? DEFAULT_GIFT_VOUCHER_TERMS,
    footer: firstNonEmpty(settings?.gift_voucher_footer, contactFooter(restaurant ?? {})),
    includeBuyerOnPdf: Boolean(settings?.gift_voucher_include_buyer_on_pdf),
  };
}

export function mapGiftVoucherSettingsRow(settings: SettingsBrandingRow | null): GiftVoucherBrandingSettings {
  return {
    displayName: settings?.gift_voucher_display_name?.trim() || null,
    offerTitle: settings?.gift_voucher_offer_title?.trim() || null,
    accentColor: settings?.gift_voucher_accent_color?.trim() || null,
    coverUrl: settings?.gift_voucher_cover_url?.trim() || null,
    terms: settings?.gift_voucher_terms?.trim() || null,
    footer: settings?.gift_voucher_footer?.trim() || null,
    includeBuyerOnPdf: Boolean(settings?.gift_voucher_include_buyer_on_pdf),
  };
}

async function loadRestaurantBranding(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<{ restaurant: RestaurantBrandingRow | null; settings: SettingsBrandingRow | null }> {
  const [{ data: restaurant }, settingsResult] = await Promise.all([
    supabase.from("restaurants").select(RESTAURANT_BRANDING_SELECT).eq("id", restaurantId).maybeSingle(),
    supabase.from("restaurant_settings").select(SETTINGS_BRANDING_SELECT).eq("restaurant_id", restaurantId).maybeSingle(),
  ]);

  let settings = (settingsResult.data as SettingsBrandingRow | null) ?? null;
  if (settingsResult.error) {
    const fallback = await supabase
      .from("restaurant_settings")
      .select(SETTINGS_BASE_SELECT)
      .eq("restaurant_id", restaurantId)
      .maybeSingle();
    settings = (fallback.data as SettingsBrandingRow | null) ?? null;
  }

  return {
    restaurant: (restaurant as RestaurantBrandingRow | null) ?? null,
    settings: (settings as SettingsBrandingRow | null) ?? null,
  };
}

export async function loadGiftVoucherPresentation(
  supabase: SupabaseClient,
  restaurantId: string,
  voucherId: string,
): Promise<GiftVoucherPresentation | null> {
  const { data, error } = await supabase
    .from("gift_vouchers")
    .select(VOUCHER_CORE_SELECT)
    .eq("restaurant_id", restaurantId)
    .eq("id", voucherId)
    .maybeSingle();

  if (error || !data) return null;

  const { restaurant, settings } = await loadRestaurantBranding(supabase, restaurantId);
  return resolveGiftVoucherPresentation(data as VoucherCoreRow, restaurant, settings);
}

export async function loadGiftVoucherPresentationByPublicToken(
  supabase: SupabaseClient,
  token: string,
): Promise<GiftVoucherPresentation | null> {
  const { data, error } = await supabase
    .from("gift_vouchers")
    .select(VOUCHER_CORE_SELECT)
    .eq("public_token", token)
    .maybeSingle();

  if (error || !data) return null;

  const voucher = data as VoucherCoreRow;
  const { restaurant, settings } = await loadRestaurantBranding(supabase, voucher.restaurant_id);
  return resolveGiftVoucherPresentation(voucher, restaurant, settings);
}

export async function loadGiftVoucherBrandingSettings(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<GiftVoucherBrandingSettings> {
  const full = await supabase
    .from("restaurant_settings")
    .select(SETTINGS_BRANDING_SELECT)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (!full.error) {
    return mapGiftVoucherSettingsRow((full.data as SettingsBrandingRow | null) ?? null);
  }
  return mapGiftVoucherSettingsRow(null);
}

export function isGiftVoucherInactiveForPass(
  presentation: Pick<GiftVoucherPresentation, "status" | "remainingAmountCents" | "expiresAt">,
  now: Date = new Date(),
): boolean {
  if (presentation.status === "used" || presentation.remainingAmountCents <= 0) return true;
  if (presentation.status === "expired" || isGiftVoucherExpired(presentation.expiresAt, now)) return true;
  if (presentation.status === "disabled" || presentation.status === "draft") return true;
  return presentation.status !== "active";
}
