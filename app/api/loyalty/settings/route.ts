import { NextResponse } from "next/server";
import { getLoyaltyRequestContext, loyaltyErrorResponse } from "@/src/lib/loyalty/http";
import { getLoyaltySettings, updateLoyaltySettings } from "@/src/lib/loyalty/service";

export async function GET() {
  const ctx = await getLoyaltyRequestContext();
  if (!ctx.ok) return ctx.response;

  try {
    const settings = await getLoyaltySettings(ctx.supabase, ctx.restaurantId);
    return NextResponse.json({ settings });
  } catch (error) {
    return loyaltyErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const ctx = await getLoyaltyRequestContext();
  if (!ctx.ok) return ctx.response;

  const payload = await request.json().catch(() => null);
  if (payload == null || typeof payload !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const settings = await updateLoyaltySettings(ctx.supabase, ctx.restaurantId, payload);
    return NextResponse.json({ settings });
  } catch (error) {
    return loyaltyErrorResponse(error);
  }
}
