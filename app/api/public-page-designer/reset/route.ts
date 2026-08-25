import { NextResponse } from "next/server";
import { getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { StorefrontServiceError, resetDraftToPublished } from "@/src/lib/public-storefront/service";

export async function POST() {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;
  try {
    const config = await resetDraftToPublished(ctx.supabase, ctx.restaurantId);
    return NextResponse.json({ config });
  } catch (error) {
    if (error instanceof StorefrontServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[public-page-designer/reset]", error);
    return NextResponse.json({ error: "Réinitialisation impossible." }, { status: 500 });
  }
}
