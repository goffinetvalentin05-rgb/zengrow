import { NextResponse } from "next/server";
import { getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { StorefrontServiceError, publishStorefrontConfig } from "@/src/lib/public-storefront/service";

export async function POST(request: Request) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;
  const body = await request.json().catch(() => null);
  const payload = body && typeof body === "object" && "config" in body ? (body as { config: unknown }).config : undefined;
  try {
    const result = await publishStorefrontConfig(ctx.supabase, ctx.restaurantId, payload);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StorefrontServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[public-page-designer/publish]", error);
    return NextResponse.json({ error: "Publication impossible." }, { status: 500 });
  }
}
