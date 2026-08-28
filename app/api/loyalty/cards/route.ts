import { NextResponse } from "next/server";
import { getLoyaltyRequestContext, loyaltyErrorResponse } from "@/src/lib/loyalty/http";
import { createLoyaltyCard, listLoyaltyCards } from "@/src/lib/loyalty/service";

export async function GET() {
  const ctx = await getLoyaltyRequestContext();
  if (!ctx.ok) return ctx.response;

  try {
    const cards = await listLoyaltyCards(ctx.supabase, ctx.restaurantId);
    return NextResponse.json({ cards });
  } catch (error) {
    return loyaltyErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const ctx = await getLoyaltyRequestContext();
  if (!ctx.ok) return ctx.response;

  const payload = await request.json().catch(() => null);
  if (payload == null || typeof payload !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const card = await createLoyaltyCard(ctx.supabase, {
      restaurantId: ctx.restaurantId,
      userId: ctx.userId,
      payload,
    });
    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    return loyaltyErrorResponse(error);
  }
}
