import { NextResponse } from "next/server";
import { getLoyaltyRequestContext, loyaltyErrorResponse } from "@/src/lib/loyalty/http";
import { deleteLoyaltyReward, updateLoyaltyReward } from "@/src/lib/loyalty/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const ctx = await getLoyaltyRequestContext();
  if (!ctx.ok) return ctx.response;

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  if (payload == null || typeof payload !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const reward = await updateLoyaltyReward(ctx.supabase, ctx.restaurantId, id, payload);
    return NextResponse.json({ reward });
  } catch (error) {
    return loyaltyErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const ctx = await getLoyaltyRequestContext();
  if (!ctx.ok) return ctx.response;

  const { id } = await context.params;
  try {
    await deleteLoyaltyReward(ctx.supabase, ctx.restaurantId, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return loyaltyErrorResponse(error);
  }
}
