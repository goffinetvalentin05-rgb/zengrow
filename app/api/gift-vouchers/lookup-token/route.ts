import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { lookupGiftVoucherByPublicToken } from "@/src/lib/gift-vouchers/service";

export async function GET(request: Request) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  const token = new URL(request.url).searchParams.get("token") ?? "";

  try {
    const result = await lookupGiftVoucherByPublicToken(ctx.supabase, ctx.restaurantId, { token });
    return NextResponse.json(result);
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}
