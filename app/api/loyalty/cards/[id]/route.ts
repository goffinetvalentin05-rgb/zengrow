import { NextResponse } from "next/server";
import { getLoyaltyRequestContext, loyaltyErrorResponse } from "@/src/lib/loyalty/http";
import { getLoyaltyCard } from "@/src/lib/loyalty/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const ctx = await getLoyaltyRequestContext();
  if (!ctx.ok) return ctx.response;

  const { id } = await context.params;
  try {
    const card = await getLoyaltyCard(ctx.supabase, ctx.restaurantId, id);
    return NextResponse.json({ card });
  } catch (error) {
    return loyaltyErrorResponse(error);
  }
}
