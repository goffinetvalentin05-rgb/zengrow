import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { loadGiftVoucherBrandingSettings } from "@/src/lib/gift-vouchers/branding";
import { GiftVoucherServiceError } from "@/src/lib/gift-vouchers/service";
import { parseGiftVoucherSettingsInput } from "@/src/lib/gift-vouchers/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  try {
    const settings = await loadGiftVoucherBrandingSettings(ctx.supabase, ctx.restaurantId);
    return NextResponse.json({ settings });
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  const payload = await request.json().catch(() => null);
  if (payload == null || typeof payload !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const input = parseGiftVoucherSettingsInput(payload);
    const row: Record<string, unknown> = {
      restaurant_id: ctx.restaurantId,
      gift_voucher_display_name: input.displayName ?? null,
      gift_voucher_offer_title: input.offerTitle ?? null,
      gift_voucher_accent_color: input.accentColor ?? null,
      gift_voucher_cover_url: input.coverUrl ?? null,
      gift_voucher_terms: input.terms ?? null,
      gift_voucher_footer: input.footer ?? null,
      gift_voucher_include_buyer_on_pdf: input.includeBuyerOnPdf ?? false,
    };
    if (input.defaultValidityMonths != null) {
      row.gift_voucher_default_validity_months = input.defaultValidityMonths;
    }
    if (input.suggestedAmounts) {
      row.gift_voucher_suggested_amounts = input.suggestedAmounts;
    }
    if (input.allowFreeAmount != null) {
      row.gift_voucher_allow_free_amount = input.allowFreeAmount;
    }
    const { error } = await ctx.supabase.from("restaurant_settings").upsert(row, { onConflict: "restaurant_id" });
    if (error) {
      throw new GiftVoucherServiceError("Impossible d’enregistrer la personnalisation des bons.", 500);
    }
    const settings = await loadGiftVoucherBrandingSettings(ctx.supabase, ctx.restaurantId);
    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
    }
    return giftVoucherErrorResponse(error);
  }
}
