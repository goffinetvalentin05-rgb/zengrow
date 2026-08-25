import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { getGiftVoucher, updateGiftVoucherStatus } from "@/src/lib/gift-vouchers/service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Bon cadeau introuvable." }, { status: 404 });
  }

  try {
    const voucher = await getGiftVoucher(ctx.supabase, ctx.restaurantId, id);
    return NextResponse.json({ voucher });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Bon cadeau introuvable." }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);
  if (payload == null || typeof payload !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const voucher = await updateGiftVoucherStatus(ctx.supabase, {
      restaurantId: ctx.restaurantId,
      id,
      payload,
    });
    return NextResponse.json({ voucher });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}
