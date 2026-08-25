import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { listGiftVoucherOffersWithStats, createGiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/service";

export async function GET() {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  try {
    const offers = await listGiftVoucherOffersWithStats(ctx.supabase, ctx.restaurantId);
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
