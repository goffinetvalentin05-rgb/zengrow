import { NextResponse } from "next/server";
import { getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { StorefrontServiceError, loadDesignerState, saveDraftConfig } from "@/src/lib/public-storefront/service";

export async function GET() {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;
  try {
    const state = await loadDesignerState(ctx.supabase, ctx.restaurantId);
    return NextResponse.json(state);
  } catch (error) {
    return storefrontError(error);
  }
}

export async function PUT(request: Request) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => null);
  const payload = body && typeof body === "object" && "config" in body ? (body as { config: unknown }).config : body;
  try {
    const config = await saveDraftConfig(ctx.supabase, ctx.restaurantId, payload);
    return NextResponse.json({ config });
  } catch (error) {
    return storefrontError(error);
  }
}

function storefrontError(error: unknown) {
  if (error instanceof StorefrontServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[public-page-designer]", error);
  return NextResponse.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 });
}
