import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { redeemGiftVoucher } from "@/src/lib/gift-vouchers/service";

export async function POST(request: Request) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  const payload = await request.json().catch(() => null);
  if (payload == null || typeof payload !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const voucher = await redeemGiftVoucher(ctx.supabase, {
      restaurantId: ctx.restaurantId,
      payload,
    });
    return NextResponse.json({ voucher });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}
