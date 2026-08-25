import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { loadGiftVoucherPresentation } from "@/src/lib/gift-vouchers/branding";
import { GiftVoucherServiceError } from "@/src/lib/gift-vouchers/service";
import { generateGiftVoucherPdf } from "@/src/lib/gift-vouchers/pdf/generate";
import { giftVoucherPdfFilename } from "@/src/lib/gift-vouchers/wallet/pass-json";
import { consumePublicVoucherRateLimit } from "@/src/lib/gift-vouchers/public-rate-limit";
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

  if (!consumePublicVoucherRateLimit(`pdf:${ctx.userId}`)) {
    return NextResponse.json({ error: "Trop de téléchargements. Réessayez dans un instant." }, { status: 429 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Bon cadeau introuvable." }, { status: 404 });
  }

  try {
    const presentation = await loadGiftVoucherPresentation(ctx.supabase, ctx.restaurantId, id);
    if (!presentation) {
      throw new GiftVoucherServiceError("Ce bon n’existe pas.", 404);
    }

    const origin = getRequestOrigin(request.headers);
    const buffer = await generateGiftVoucherPdf({ presentation, origin });
    const filename = giftVoucherPdfFilename(presentation.code);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}
