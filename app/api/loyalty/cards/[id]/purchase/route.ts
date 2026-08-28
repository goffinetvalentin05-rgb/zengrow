import { NextResponse } from "next/server";
import { getLoyaltyRequestContext, loyaltyErrorResponse } from "@/src/lib/loyalty/http";
import { addLoyaltyPurchase } from "@/src/lib/loyalty/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const ctx = await getLoyaltyRequestContext();
  if (!ctx.ok) return ctx.response;

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  if (payload == null || typeof payload !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const result = await addLoyaltyPurchase(ctx.supabase, ctx.restaurantId, id, payload);
    return NextResponse.json(result);
  } catch (error) {
    return loyaltyErrorResponse(error);
  }
}
