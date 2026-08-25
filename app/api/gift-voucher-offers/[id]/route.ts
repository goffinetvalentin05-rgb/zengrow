import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import {
  duplicateGiftVoucherOffer,
  getGiftVoucherOffer,
  updateGiftVoucherOffer,
} from "@/src/lib/gift-vouchers/offers/service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await context.params;
  try {
    const offer = await getGiftVoucherOffer(ctx.supabase, ctx.restaurantId, id);
    return NextResponse.json({ offer });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  if (payload == null || typeof payload !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const action = "action" in payload ? String((payload as { action?: string }).action) : null;
  try {
    if (action === "duplicate") {
      const offer = await duplicateGiftVoucherOffer(ctx.supabase, {
        restaurantId: ctx.restaurantId,
        id,
      });
      return NextResponse.json({ offer }, { status: 201 });
    }
    if (action === "archive") {
      const offer = await updateGiftVoucherOffer(ctx.supabase, {
        restaurantId: ctx.restaurantId,
        id,
        payload: { status: "archived" },
      });
      return NextResponse.json({ offer });
    }
    if (action === "activate") {
      const offer = await updateGiftVoucherOffer(ctx.supabase, {
        restaurantId: ctx.restaurantId,
        id,
        payload: { status: "active" },
      });
      return NextResponse.json({ offer });
    }
    if (action === "deactivate") {
      const offer = await updateGiftVoucherOffer(ctx.supabase, {
        restaurantId: ctx.restaurantId,
        id,
        payload: { status: "inactive" },
      });
      return NextResponse.json({ offer });
    }
    const offer = await updateGiftVoucherOffer(ctx.supabase, {
      restaurantId: ctx.restaurantId,
      id,
      payload,
    });
    return NextResponse.json({ offer });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}
