import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { lookupGiftVoucherByCode } from "@/src/lib/gift-vouchers/service";

export async function GET(request: Request) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  const code = new URL(request.url).searchParams.get("code") ?? "";

  try {
    const result = await lookupGiftVoucherByCode(ctx.supabase, ctx.restaurantId, { code });
    return NextResponse.json(result);
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}
