import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_PRIMARY, contrastingTextColor, normalizeHexColor } from "@/src/lib/public-page/colors";
import {
  clampGiftVoucherValidityMonths,
  DEFAULT_GIFT_VOUCHER_VALIDITY_MONTHS,
  parseSuggestedGiftVoucherAmounts,
} from "@/src/lib/gift-vouchers/defaults";
import { isGiftVoucherExpired } from "@/src/lib/gift-vouchers/redeem";
import { isPublicGiftVoucherStatus } from "@/src/lib/gift-vouchers/public-view";
import type { GiftVoucherOfferKind } from "@/src/lib/gift-vouchers/offers/types";
import { isGiftVoucherOfferKind } from "@/src/lib/gift-vouchers/offers/types";
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
  offerKind: GiftVoucherOfferKind;
  offerDescription: string | null;
  experienceLabel: string | null;
  partySize: number | null;
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
  defaultValidityMonths: number;
  suggestedAmounts: number[];
  allowFreeAmount: boolean;
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
  offer_kind?: string | null;
  offer_title_snapshot?: string | null;
  offer_description_snapshot?: string | null;
  offer_image_url_snapshot?: string | null;
  offer_terms_snapshot?: string | null;
  offer_experience_label_snapshot?: string | null;
  offer_party_size_snapshot?: number | null;
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
  gift_voucher_default_validity_months?: number | null;
  gift_voucher_suggested_amounts?: number[] | null;
  gift_voucher_allow_free_amount?: boolean | null;
};

const VOUCHER_CORE_SELECT =
  "id, restaurant_id, code, status, initial_amount_cents, remaining_amount_cents, currency, expires_at, recipient_name, buyer_name, message, public_token, offer_kind, offer_title_snapshot, offer_description_snapshot, offer_image_url_snapshot, offer_terms_snapshot, offer_experience_label_snapshot, offer_party_size_snapshot";

const RESTAURANT_BRANDING_SELECT =
  "name, public_display_name, logo_url, public_accent_color, phone, email, address, banner_url";

const SETTINGS_BASE_SELECT = "logo_url, cover_image_url, accent_color";
const SETTINGS_BRANDING_SELECT = `${SETTINGS_BASE_SELECT}, gift_voucher_display_name, gift_voucher_offer_title, gift_voucher_accent_color, gift_voucher_cover_url, gift_voucher_terms, gift_voucher_footer, gift_voucher_include_buyer_on_pdf, gift_voucher_default_validity_months, gift_voucher_suggested_amounts, gift_voucher_allow_free_amount`;

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
      firstNonEmpty(voucher.offer_title_snapshot, settings?.gift_voucher_offer_title) ??
      DEFAULT_GIFT_VOUCHER_OFFER_TITLE,
    offerKind: isGiftVoucherOfferKind(voucher.offer_kind) ? voucher.offer_kind : "monetary",
    offerDescription: firstNonEmpty(voucher.offer_description_snapshot),
    experienceLabel: firstNonEmpty(voucher.offer_experience_label_snapshot, voucher.offer_title_snapshot),
    partySize:
      typeof voucher.offer_party_size_snapshot === "number" && voucher.offer_party_size_snapshot > 0
        ? voucher.offer_party_size_snapshot
        : null,
    restaurantName:
      firstNonEmpty(settings?.gift_voucher_display_name, restaurant?.public_display_name, restaurant?.name) ??
      "Établissement",
    restaurantLogoUrl: firstNonEmpty(settings?.logo_url, restaurant?.logo_url),
    coverImageUrl: firstNonEmpty(
      voucher.offer_image_url_snapshot,
      settings?.gift_voucher_cover_url,
      settings?.cover_image_url,
      restaurant?.banner_url,
    ),
    accentColor,
    foregroundColor: contrastingTextColor(accentColor),
    phone: restaurant?.phone?.trim() || null,
    email: restaurant?.email?.trim() || null,
    address: restaurant?.address?.trim() || null,
    terms: firstNonEmpty(voucher.offer_terms_snapshot, settings?.gift_voucher_terms) ?? DEFAULT_GIFT_VOUCHER_TERMS,
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
    defaultValidityMonths: clampGiftVoucherValidityMonths(
      settings?.gift_voucher_default_validity_months ?? DEFAULT_GIFT_VOUCHER_VALIDITY_MONTHS,
    ),
    suggestedAmounts: parseSuggestedGiftVoucherAmounts(settings?.gift_voucher_suggested_amounts),
    allowFreeAmount: settings?.gift_voucher_allow_free_amount !== false,
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
    const withoutFree = await supabase
      .from("restaurant_settings")
      .select(SETTINGS_BRANDING_SELECT.replace(", gift_voucher_allow_free_amount", ""))
      .eq("restaurant_id", restaurantId)
      .maybeSingle();
    if (!withoutFree.error) {
      settings = (withoutFree.data as SettingsBrandingRow | null) ?? null;
    } else {
      const fallback = await supabase
        .from("restaurant_settings")
        .select(SETTINGS_BASE_SELECT)
        .eq("restaurant_id", restaurantId)
        .maybeSingle();
      settings = (fallback.data as SettingsBrandingRow | null) ?? null;
    }
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
  const withoutFree = await supabase
    .from("restaurant_settings")
    .select(SETTINGS_BRANDING_SELECT.replace(", gift_voucher_allow_free_amount", ""))
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (!withoutFree.error) {
    return mapGiftVoucherSettingsRow((withoutFree.data as SettingsBrandingRow | null) ?? null);
  }
  return mapGiftVoucherSettingsRow(null);
}

export async function loadGiftVoucherOfferPreviewPresentation(
  supabase: SupabaseClient,
  restaurantId: string,
  offer: {
    id: string;
    title: string;
    shortDescription: string | null;
    detailedDescription: string | null;
    imageUrl: string | null;
    kind: "monetary" | "experience";
    salePriceCents: number;
    faceValueCents: number | null;
    experienceLabel: string | null;
    partySize: number | null;
    terms: string | null;
  },
): Promise<GiftVoucherPresentation | null> {
  const { restaurant, settings } = await loadRestaurantBranding(supabase, restaurantId);
  const amount =
    offer.kind === "monetary"
      ? offer.faceValueCents && offer.faceValueCents > 0
        ? offer.faceValueCents
        : offer.salePriceCents
      : offer.salePriceCents > 0
        ? offer.salePriceCents
        : 1;
  const fake: VoucherCoreRow = {
    id: offer.id,
    restaurant_id: restaurantId,
    code: "ZG-APER-CU00",
    status: "active",
    initial_amount_cents: amount,
    remaining_amount_cents: amount,
    currency: "CHF",
    expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
    recipient_name: "Bénéficiaire",
    buyer_name: "Aperçu",
    message: null,
    public_token: "ab".repeat(32),
    offer_kind: offer.kind,
    offer_title_snapshot: offer.title,
    offer_description_snapshot: offer.shortDescription || offer.detailedDescription,
    offer_image_url_snapshot: offer.imageUrl,
    offer_terms_snapshot: offer.terms,
    offer_experience_label_snapshot: offer.experienceLabel || offer.title,
    offer_party_size_snapshot: offer.partySize,
  };
  return resolveGiftVoucherPresentation(fake, restaurant, settings);
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
