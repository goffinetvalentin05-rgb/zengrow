import { NextResponse } from "next/server";
import { getLoyaltyRequestContext, loyaltyErrorResponse } from "@/src/lib/loyalty/http";
import { lookupLoyaltyCardFromScan } from "@/src/lib/loyalty/service";

export async function POST(request: Request) {
  const ctx = await getLoyaltyRequestContext();
  if (!ctx.ok) return ctx.response;

  const payload = (await request.json().catch(() => null)) as { raw?: unknown } | null;
  const raw = typeof payload?.raw === "string" ? payload.raw : "";
  if (!raw.trim()) {
    return NextResponse.json({ error: "Cette carte n’existe pas." }, { status: 404 });
  }

  try {
    const card = await lookupLoyaltyCardFromScan(ctx.supabase, ctx.restaurantId, raw);
    return NextResponse.json({ card });
  } catch (error) {
    return loyaltyErrorResponse(error);
  }
}

export async function GET(request: Request) {
  const ctx = await getLoyaltyRequestContext();
  if (!ctx.ok) return ctx.response;

  const url = new URL(request.url);
  const raw = url.searchParams.get("raw") ?? url.searchParams.get("code") ?? url.searchParams.get("token") ?? "";
  if (!raw.trim()) {
    return NextResponse.json({ error: "Cette carte n’existe pas." }, { status: 404 });
  }

  try {
    const card = await lookupLoyaltyCardFromScan(ctx.supabase, ctx.restaurantId, raw);
    return NextResponse.json({ card });
  } catch (error) {
    return loyaltyErrorResponse(error);
  }
}
