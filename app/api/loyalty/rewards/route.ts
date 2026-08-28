import { NextResponse } from "next/server";
import { getLoyaltyRequestContext, loyaltyErrorResponse } from "@/src/lib/loyalty/http";
import { createLoyaltyReward, listLoyaltyRewards } from "@/src/lib/loyalty/service";

export async function GET() {
  const ctx = await getLoyaltyRequestContext();
  if (!ctx.ok) return ctx.response;

  try {
    const rewards = await listLoyaltyRewards(ctx.supabase, ctx.restaurantId);
    return NextResponse.json({ rewards });
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
    const reward = await createLoyaltyReward(ctx.supabase, ctx.restaurantId, payload);
    return NextResponse.json({ reward }, { status: 201 });
  } catch (error) {
    return loyaltyErrorResponse(error);
  }
}
