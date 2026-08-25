import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { loadGiftVoucherOfferPreviewPresentation } from "@/src/lib/gift-vouchers/branding";
import { getGiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/service";
import { generateGiftVoucherPdf } from "@/src/lib/gift-vouchers/pdf/generate";
import { GiftVoucherServiceError } from "@/src/lib/gift-vouchers/errors";
import { getRequestOrigin } from "@/src/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await context.params;

  try {
    const offer = await getGiftVoucherOffer(ctx.supabase, ctx.restaurantId, id);
    const presentation = await loadGiftVoucherOfferPreviewPresentation(ctx.supabase, ctx.restaurantId, offer);
    if (!presentation) {
      throw new GiftVoucherServiceError("Impossible de prévisualiser cette offre.", 500);
    }
    const origin = getRequestOrigin(request.headers);
    const buffer = await generateGiftVoucherPdf({ presentation, origin });
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="apercu-offre.pdf"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}
