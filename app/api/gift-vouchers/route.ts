import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { createGiftVoucher, listGiftVouchers } from "@/src/lib/gift-vouchers/service";

export async function GET() {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  try {
    const vouchers = await listGiftVouchers(ctx.supabase, ctx.restaurantId);
    return NextResponse.json({ vouchers });
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
    const voucher = await createGiftVoucher(ctx.supabase, {
      restaurantId: ctx.restaurantId,
      userId: ctx.userId,
      payload,
    });
    return NextResponse.json({ voucher }, { status: 201 });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}
