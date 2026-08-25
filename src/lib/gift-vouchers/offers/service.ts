import { ZodError } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GiftVoucherServiceError } from "@/src/lib/gift-vouchers/errors";
import {
  GIFT_VOUCHER_OFFER_SELECT,
  mapGiftVoucherOfferRow,
  type GiftVoucherOfferRow,
} from "@/src/lib/gift-vouchers/offers/map";
import {
  parseCreateGiftVoucherOfferInput,
  parseReorderGiftVoucherOfferIds,
  parseUpdateGiftVoucherOfferInput,
} from "@/src/lib/gift-vouchers/offers/schemas";
import type { CreateGiftVoucherOfferInput, GiftVoucherOffer, GiftVoucherOfferListItem, GiftVoucherOfferStatus } from "@/src/lib/gift-vouchers/offers/types";

function firstZodMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Données invalides.";
}

function asOffer(row: GiftVoucherOfferRow): GiftVoucherOffer {
  return mapGiftVoucherOfferRow(row);
}

export async function listGiftVoucherOffers(
  supabase: SupabaseClient,
  restaurantId: string,
  options: { includeArchived?: boolean } = {},
): Promise<GiftVoucherOffer[]> {
  let query = supabase
    .from("gift_voucher_offers")
    .select(GIFT_VOUCHER_OFFER_SELECT)
    .eq("restaurant_id", restaurantId)
    .order("sort_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (!options.includeArchived) {
    query = query.neq("status", "archived");
  }

  const { data, error } = await query;
  if (error) {
    throw new GiftVoucherServiceError("Impossible de charger les offres.", 500);
  }
  return ((data ?? []) as GiftVoucherOfferRow[]).map(asOffer);
}

export async function countIssuedGiftVouchersByOffer(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("gift_vouchers")
    .select("offer_id")
    .eq("restaurant_id", restaurantId)
    .not("offer_id", "is", null);
  const counts = new Map<string, number>();
  if (error || !data) return counts;
  for (const row of data as Array<{ offer_id: string | null }>) {
    if (!row.offer_id) continue;
    counts.set(row.offer_id, (counts.get(row.offer_id) ?? 0) + 1);
  }
  return counts;
}

export async function listGiftVoucherOffersWithStats(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<GiftVoucherOfferListItem[]> {
  const [offers, counts] = await Promise.all([
    listGiftVoucherOffers(supabase, restaurantId, { includeArchived: true }),
    countIssuedGiftVouchersByOffer(supabase, restaurantId),
  ]);
  return offers.map((offer) => ({
    ...offer,
    issuedCount: counts.get(offer.id) ?? 0,
  }));
}

export async function listPublicGiftVoucherOffers(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<GiftVoucherOffer[]> {
  const { data, error } = await supabase
    .from("gift_voucher_offers")
    .select(GIFT_VOUCHER_OFFER_SELECT)
    .eq("restaurant_id", restaurantId)
    .eq("status", "active")
    .order("sort_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return [];
  return ((data ?? []) as GiftVoucherOfferRow[]).map(asOffer);
}

export async function getGiftVoucherOffer(
  supabase: SupabaseClient,
  restaurantId: string,
  id: string,
): Promise<GiftVoucherOffer> {
  const { data, error } = await supabase
    .from("gift_voucher_offers")
    .select(GIFT_VOUCHER_OFFER_SELECT)
    .eq("restaurant_id", restaurantId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new GiftVoucherServiceError("Impossible de charger cette offre.", 500);
  }
  if (!data) {
    throw new GiftVoucherServiceError("Cette offre n’existe pas.", 404);
  }
  return asOffer(data as GiftVoucherOfferRow);
}

export async function getActiveGiftVoucherOffer(
  supabase: SupabaseClient,
  restaurantId: string,
  id: string,
): Promise<GiftVoucherOffer> {
  const offer = await getGiftVoucherOffer(supabase, restaurantId, id);
  if (offer.status !== "active") {
    throw new GiftVoucherServiceError("Cette offre n’est plus disponible.", 409);
  }
  return offer;
}

async function nextSortIndex(supabase: SupabaseClient, restaurantId: string): Promise<number> {
  const { data } = await supabase
    .from("gift_voucher_offers")
    .select("sort_index")
    .eq("restaurant_id", restaurantId)
    .order("sort_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (Number(data?.sort_index) || 0) + 1;
}

function rowFromCreateInput(restaurantId: string, input: CreateGiftVoucherOfferInput, sortIndex: number) {
  return {
    restaurant_id: restaurantId,
    title: input.title.trim(),
    short_description: input.shortDescription?.trim() || null,
    detailed_description: input.detailedDescription?.trim() || null,
    image_url: input.imageUrl?.trim() || null,
    kind: input.kind,
    sale_price_cents: input.salePriceCents,
    face_value_cents: input.kind === "monetary" ? (input.faceValueCents ?? input.salePriceCents) : input.faceValueCents ?? null,
    experience_label: input.kind === "experience" ? (input.experienceLabel?.trim() || input.title.trim()) : input.experienceLabel?.trim() || null,
    party_size: input.partySize ?? null,
    validity_months: input.validityMonths ?? 12,
    terms: input.terms?.trim() || null,
    sort_index: sortIndex,
    status: (input.status ?? "active") as GiftVoucherOfferStatus,
  };
}

export async function createGiftVoucherOffer(
  supabase: SupabaseClient,
  params: { restaurantId: string; payload: unknown },
): Promise<GiftVoucherOffer> {
  let input: CreateGiftVoucherOfferInput;
  try {
    input = parseCreateGiftVoucherOfferInput(params.payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new GiftVoucherServiceError(firstZodMessage(error), 400);
    }
    throw new GiftVoucherServiceError("Données invalides.", 400);
  }

  const sortIndex = await nextSortIndex(supabase, params.restaurantId);
  const { data, error } = await supabase
    .from("gift_voucher_offers")
    .insert(rowFromCreateInput(params.restaurantId, input, sortIndex))
    .select(GIFT_VOUCHER_OFFER_SELECT)
    .single();

  if (error || !data) {
    throw new GiftVoucherServiceError("Impossible de créer l’offre.", 500);
  }
  return asOffer(data as GiftVoucherOfferRow);
}

export async function updateGiftVoucherOffer(
  supabase: SupabaseClient,
  params: { restaurantId: string; id: string; payload: unknown },
): Promise<GiftVoucherOffer> {
  let input: ReturnType<typeof parseUpdateGiftVoucherOfferInput>;
  try {
    input = parseUpdateGiftVoucherOfferInput(params.payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new GiftVoucherServiceError(firstZodMessage(error), 400);
    }
    throw new GiftVoucherServiceError("Données invalides.", 400);
  }

  const current = await getGiftVoucherOffer(supabase, params.restaurantId, params.id);
  const kind = input.kind ?? current.kind;
  const patch: Record<string, unknown> = {};

  if (input.title != null) patch.title = input.title.trim();
  if (input.shortDescription !== undefined) patch.short_description = input.shortDescription?.trim() || null;
  if (input.detailedDescription !== undefined) patch.detailed_description = input.detailedDescription?.trim() || null;
  if (input.clearImage) patch.image_url = null;
  else if (input.imageUrl !== undefined) patch.image_url = input.imageUrl?.trim() || null;
  if (input.kind != null) patch.kind = input.kind;
  if (input.salePriceCents != null) patch.sale_price_cents = input.salePriceCents;
  if (input.faceValueCents != null) patch.face_value_cents = input.faceValueCents;
  if (kind === "monetary" && patch.face_value_cents == null && input.salePriceCents != null) {
    patch.face_value_cents = input.salePriceCents;
  }
  if (input.experienceLabel !== undefined) {
    patch.experience_label = input.experienceLabel?.trim() || null;
  }
  if (input.partySize !== undefined) patch.party_size = input.partySize;
  if (input.validityMonths != null) patch.validity_months = input.validityMonths;
  if (input.terms !== undefined) patch.terms = input.terms?.trim() || null;
  if (input.status != null) patch.status = input.status;

  if (Object.keys(patch).length === 0) return current;

  const { data, error } = await supabase
    .from("gift_voucher_offers")
    .update(patch)
    .eq("restaurant_id", params.restaurantId)
    .eq("id", params.id)
    .select(GIFT_VOUCHER_OFFER_SELECT)
    .maybeSingle();

  if (error || !data) {
    throw new GiftVoucherServiceError("Impossible de modifier cette offre.", 500);
  }
  return asOffer(data as GiftVoucherOfferRow);
}

export async function duplicateGiftVoucherOffer(
  supabase: SupabaseClient,
  params: { restaurantId: string; id: string },
): Promise<GiftVoucherOffer> {
  const source = await getGiftVoucherOffer(supabase, params.restaurantId, params.id);
  const sortIndex = await nextSortIndex(supabase, params.restaurantId);
  const title = source.title.startsWith("Copie de ") ? source.title : `Copie de ${source.title}`;
  const { data, error } = await supabase
    .from("gift_voucher_offers")
    .insert(
      rowFromCreateInput(
        params.restaurantId,
        {
          title,
          shortDescription: source.shortDescription ?? undefined,
          detailedDescription: source.detailedDescription ?? undefined,
          imageUrl: source.imageUrl ?? undefined,
          kind: source.kind,
          salePriceCents: source.salePriceCents,
          faceValueCents: source.faceValueCents ?? undefined,
          experienceLabel: source.experienceLabel ?? undefined,
          partySize: source.partySize ?? undefined,
          validityMonths: source.validityMonths,
          terms: source.terms ?? undefined,
          status: "inactive",
        },
        sortIndex,
      ),
    )
    .select(GIFT_VOUCHER_OFFER_SELECT)
    .single();

  if (error || !data) {
    throw new GiftVoucherServiceError("Impossible de dupliquer cette offre.", 500);
  }
  return asOffer(data as GiftVoucherOfferRow);
}

export async function reorderGiftVoucherOffers(
  supabase: SupabaseClient,
  params: { restaurantId: string; payload: unknown },
): Promise<GiftVoucherOffer[]> {
  let ids: string[];
  try {
    ids = parseReorderGiftVoucherOfferIds(params.payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new GiftVoucherServiceError(firstZodMessage(error), 400);
    }
    throw new GiftVoucherServiceError("Données invalides.", 400);
  }

  const existing = await listGiftVoucherOffers(supabase, params.restaurantId, { includeArchived: true });
  const allowed = new Set(existing.map((offer) => offer.id));
  const ordered = ids.filter((id) => allowed.has(id));
  await Promise.all(
    ordered.map((id, index) =>
      supabase
        .from("gift_voucher_offers")
        .update({ sort_index: index })
        .eq("restaurant_id", params.restaurantId)
        .eq("id", id),
    ),
  );
  return listGiftVoucherOffers(supabase, params.restaurantId, { includeArchived: true });
}
