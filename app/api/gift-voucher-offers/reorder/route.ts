import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { reorderGiftVoucherOffers } from "@/src/lib/gift-vouchers/offers/service";

export async function PATCH(request: Request) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  const payload = await request.json().catch(() => null);
  if (payload == null || typeof payload !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const offers = await reorderGiftVoucherOffers(ctx.supabase, {
      restaurantId: ctx.restaurantId,
      payload,
    });
    return NextResponse.json({ offers });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}
