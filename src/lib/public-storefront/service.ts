import { ZodError } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toPublicGiftVoucherOffer, GIFT_VOUCHER_OFFER_SELECT, mapGiftVoucherOfferRow, type GiftVoucherOfferRow } from "@/src/lib/gift-vouchers/offers/map";
import type { PublicGiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/types";
import { DEFAULT_PRIMARY, normalizeHexColor } from "@/src/lib/public-page/colors";
import { defaultStorefrontConfig } from "@/src/lib/public-storefront/defaults";
import { identityFromRows, type StorefrontIdentity } from "@/src/lib/public-storefront/identity";
import { hydrateStorefrontConfig, parseStorefrontConfig, type StorefrontConfig } from "@/src/lib/public-storefront/schema";
import { sanitizeStorefrontPayload } from "@/src/lib/public-storefront/sanitize";
import { getDefaultOpeningHours, type OpeningHours } from "@/src/lib/utils";

export class StorefrontServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "StorefrontServiceError";
  }
}

export type StorefrontDesignerState = {
  identity: StorefrontIdentity;
  offers: PublicGiftVoucherOffer[];
  draft: StorefrontConfig;
  published: StorefrontConfig | null;
  publishedAt: string | null;
  updatedAt: string | null;
};

type ConfigRow = {
  draft_config: unknown;
  published_config: unknown;
  published_at: string | null;
  updated_at: string | null;
};

export async function loadStorefrontIdentity(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<StorefrontIdentity> {
  const [{ data: restaurant, error: restaurantError }, { data: settings }] = await Promise.all([
    supabase
      .from("restaurants")
      .select(
        "id, name, slug, phone, email, address, city, cuisine_type, logo_url, banner_url, primary_color, public_display_name, public_tagline, public_description, google_maps_url, tiktok_url",
      )
      .eq("id", restaurantId)
      .maybeSingle(),
    supabase
      .from("restaurant_settings")
      .select(
        "logo_url, cover_image_url, website_url, instagram_url, facebook_url, opening_hours, gallery_image_urls, public_page_description",
      )
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
  ]);

  if (restaurantError || !restaurant) {
    throw new StorefrontServiceError("Établissement introuvable.", 404);
  }

  const restaurantRecord = restaurant as Record<string, unknown>;
  const settingsRecord = (settings ?? {}) as Record<string, unknown>;

  return identityFromRows({
    restaurantId: restaurant.id as string,
    name: restaurant.name as string,
    slug: restaurant.slug as string,
    displayName: (restaurantRecord.public_display_name as string | null) ?? null,
    tagline: (restaurantRecord.public_tagline as string | null) ?? null,
    description:
      (restaurantRecord.public_description as string | null) ??
      (settingsRecord.public_page_description as string | null) ??
      null,
    category: (restaurantRecord.cuisine_type as string | null) ?? null,
    address: restaurant.address as string | null,
    city: (restaurantRecord.city as string | null) ?? null,
    phone: restaurant.phone as string | null,
    email: restaurant.email as string | null,
    websiteUrl: (settingsRecord.website_url as string | null) ?? null,
    logoUrl: (settingsRecord.logo_url as string | null) || (restaurant.logo_url as string | null),
    coverUrl: (settingsRecord.cover_image_url as string | null) ?? null,
    bannerUrl: (restaurantRecord.banner_url as string | null) ?? null,
    primaryColor: normalizeHexColor((restaurant.primary_color as string | null) ?? "", DEFAULT_PRIMARY),
    instagramUrl: (settingsRecord.instagram_url as string | null) ?? null,
    facebookUrl: (settingsRecord.facebook_url as string | null) ?? null,
    tiktokUrl: (restaurantRecord.tiktok_url as string | null) ?? null,
    googleMapsUrl: (restaurantRecord.google_maps_url as string | null) ?? null,
    openingHours: (settingsRecord.opening_hours as OpeningHours | null) ?? getDefaultOpeningHours(),
    galleryUrls: (settingsRecord.gallery_image_urls as string[] | null) ?? [],
  });
}

export async function loadPublicGiftOffers(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<PublicGiftVoucherOffer[]> {
  const { data, error } = await supabase
    .from("gift_voucher_offers")
    .select(GIFT_VOUCHER_OFFER_SELECT)
    .eq("restaurant_id", restaurantId)
    .eq("status", "active")
    .order("sort_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as GiftVoucherOfferRow[]).map((row) => toPublicGiftVoucherOffer(mapGiftVoucherOfferRow(row)));
}

async function getOrCreateConfigRow(
  supabase: SupabaseClient,
  restaurantId: string,
  identity: StorefrontIdentity,
): Promise<ConfigRow> {
  const { data, error } = await supabase
    .from("restaurant_public_page_config")
    .select("draft_config, published_config, published_at, updated_at")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (error) {
    throw new StorefrontServiceError("Impossible de charger la page publique.", 500);
  }

  if (data) return data as ConfigRow;

  const draft = defaultStorefrontConfig(identity);
  const { data: inserted, error: insertError } = await supabase
    .from("restaurant_public_page_config")
    .insert({
      restaurant_id: restaurantId,
      draft_config: draft,
      draft_document: draft,
    })
    .select("draft_config, published_config, published_at, updated_at")
    .single();

  if (insertError || !inserted) {
    throw new StorefrontServiceError("Impossible d’initialiser la page publique.", 500);
  }

  return inserted as ConfigRow;
}

export async function loadDesignerState(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<StorefrontDesignerState> {
  const identity = await loadStorefrontIdentity(supabase, restaurantId);
  const [offers, row] = await Promise.all([
    loadPublicGiftOffers(supabase, restaurantId),
    getOrCreateConfigRow(supabase, restaurantId, identity),
  ]);
  const fallback = defaultStorefrontConfig(identity);
  return {
    identity,
    offers,
    draft: hydrateStorefrontConfig(row.draft_config, fallback),
    published: row.published_config ? hydrateStorefrontConfig(row.published_config, fallback) : null,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

export function parseDesignerPayload(payload: unknown): StorefrontConfig {
  try {
    return parseStorefrontConfig(hydrateStorefrontConfig(sanitizeStorefrontPayload(payload), defaultStorefrontConfig()));
  } catch (error) {
    if (error instanceof ZodError) {
      throw new StorefrontServiceError("Configuration invalide. Vérifiez les champs du concepteur.", 400);
    }
    throw error;
  }
}

export async function saveDraftConfig(
  supabase: SupabaseClient,
  restaurantId: string,
  payload: unknown,
): Promise<StorefrontConfig> {
  const draft = parseDesignerPayload(payload);
  const { error } = await supabase.from("restaurant_public_page_config").upsert(
    {
      restaurant_id: restaurantId,
      draft_config: draft,
      draft_document: draft,
    },
    { onConflict: "restaurant_id" },
  );
  if (error) {
    throw new StorefrontServiceError("Enregistrement du brouillon impossible.", 500);
  }
  return draft;
}

export async function publishStorefrontConfig(
  supabase: SupabaseClient,
  restaurantId: string,
  payload?: unknown,
): Promise<{ config: StorefrontConfig; publishedAt: string }> {
  const draft =
    payload !== undefined
      ? parseDesignerPayload(payload)
      : (await loadDesignerState(supabase, restaurantId)).draft;

  const publishedAt = new Date().toISOString();
  const { error } = await supabase.from("restaurant_public_page_config").upsert(
    {
      restaurant_id: restaurantId,
      draft_config: draft,
      published_config: draft,
      draft_document: draft,
      published_document: draft,
      published_at: publishedAt,
    },
    { onConflict: "restaurant_id" },
  );

  if (error) {
    throw new StorefrontServiceError("Publication impossible.", 500);
  }

  await supabase
    .from("restaurants")
    .update({
      primary_color: draft.style.primaryColor,
      banner_url: draft.hero.coverImageUrl || null,
      public_hero_title: draft.hero.title || null,
      public_tagline: draft.hero.subtitle || null,
    })
    .eq("id", restaurantId);

  await supabase
    .from("restaurant_settings")
    .update({
      cover_image_url: draft.hero.coverImageUrl || null,
    })
    .eq("restaurant_id", restaurantId);

  return { config: draft, publishedAt };
}

export async function resetDraftToPublished(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<StorefrontConfig> {
  const state = await loadDesignerState(supabase, restaurantId);
  const next = state.published ?? defaultStorefrontConfig(state.identity);
  const { error } = await supabase.from("restaurant_public_page_config").upsert(
    {
      restaurant_id: restaurantId,
      draft_config: next,
      draft_document: next,
    },
    { onConflict: "restaurant_id" },
  );
  if (error) {
    throw new StorefrontServiceError("Réinitialisation impossible.", 500);
  }
  return next;
}
