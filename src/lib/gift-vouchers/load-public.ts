import { createClient } from "@/src/lib/supabase/server";
import { normalizeGiftVoucherPublicToken } from "@/src/lib/gift-vouchers/public-token";
import { isGiftVoucherOfferKind } from "@/src/lib/gift-vouchers/offers/types";
import {
  isPublicGiftVoucherStatus,
  type PublicGiftVoucherView,
} from "@/src/lib/gift-vouchers/public-view";

type PublicRpcRow = {
  code: string;
  status: string;
  initial_amount_cents: number;
  remaining_amount_cents: number;
  currency: string;
  expires_at: string | null;
  recipient_name: string | null;
  restaurant_name: string | null;
  restaurant_logo_url: string | null;
  offer_kind?: string | null;
  offer_title?: string | null;
  offer_description?: string | null;
  offer_image_url?: string | null;
  offer_experience_label?: string | null;
  offer_party_size?: number | null;
  message?: string | null;
};

export async function loadPublicGiftVoucherByToken(
  rawToken: string,
): Promise<PublicGiftVoucherView | null> {
  const token = normalizeGiftVoucherPublicToken(rawToken);
  if (!token) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_gift_voucher_by_public_token", {
    p_token: token,
  });

  if (error) {
    console.error("[gift-vouchers/public]", error);
    return null;
  }

  const row = Array.isArray(data) ? (data[0] as PublicRpcRow | undefined) : (data as PublicRpcRow | null);
  if (!row?.code || !isPublicGiftVoucherStatus(row.status)) return null;

  return {
    code: row.code,
    status: row.status,
    initialAmountCents: row.initial_amount_cents,
    remainingAmountCents: row.remaining_amount_cents,
    currency: row.currency || "CHF",
    expiresAt: row.expires_at,
    recipientName: row.recipient_name,
    restaurantName: row.restaurant_name?.trim() || "Établissement",
    restaurantLogoUrl: row.restaurant_logo_url?.trim() || null,
    publicToken: token,
    offerKind: isGiftVoucherOfferKind(row.offer_kind) ? row.offer_kind : "monetary",
    offerTitle: row.offer_title?.trim() || null,
    offerDescription: row.offer_description?.trim() || null,
    offerImageUrl: row.offer_image_url?.trim() || null,
    experienceLabel: row.offer_experience_label?.trim() || null,
    partySize: row.offer_party_size ?? null,
    message: row.message?.trim() || null,
  };
}
