import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { createGiftVoucherOffer, listGiftVoucherOffers } from "@/src/lib/gift-vouchers/offers/service";

export async function GET(request: Request) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  const includeArchived = new URL(request.url).searchParams.get("includeArchived") === "1";

  try {
    const offers = await listGiftVoucherOffers(ctx.supabase, ctx.restaurantId, { includeArchived });
    return NextResponse.json({ offers });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  const payload = await request.json().catch(() => null);
  if (payload == null || typeof payload !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const offer = await createGiftVoucherOffer(ctx.supabase, {
      restaurantId: ctx.restaurantId,
      payload,
    });
    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}
