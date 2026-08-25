import { NextRequest, NextResponse } from "next/server";
import { isGiftCardsEnabled } from "@/src/lib/config/features";
import { notifyGiftVoucherRequest } from "@/src/lib/notifications/gift-voucher";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: NextRequest) {
  // GIFT_CARDS feature flag — réactivable
  if (!isGiftCardsEnabled()) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as {
    slug?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    amount?: string;
    message?: string;
    beneficiary?: string;
    occasion?: string;
  };

  const slug = (body.slug ?? "").trim().toLowerCase();
  const firstName = (body.firstName ?? "").trim();
  const lastName = (body.lastName ?? "").trim();
  const email = (body.email ?? "").trim();

  if (!slug || !firstName || !lastName || !email) {
    return NextResponse.json({ ok: false, error: "Données incomplètes." }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data: id, error } = await supabase.rpc("submit_gift_voucher_request", {
      p_slug: slug,
      p_first_name: firstName,
      p_last_name: lastName,
      p_email: email,
      p_phone: (body.phone ?? "").trim() || null,
      p_amount: (body.amount ?? "").trim() || null,
      p_message: (body.message ?? "").trim() || null,
      p_beneficiary: (body.beneficiary ?? "").trim() || null,
      p_occasion: (body.occasion ?? "").trim() || null,
    });

    if (error) {
      console.error("submit_gift_voucher_request", error);
      return NextResponse.json(
        { ok: false, error: "Impossible d'enregistrer la demande." },
        { status: 400 },
      );
    }
    if (!id) {
      return NextResponse.json({ ok: false, error: "Restaurant introuvable ou données invalides." }, { status: 400 });
    }

    const { data: restaurant } = await supabase.from("restaurants").select("id").eq("slug", slug).maybeSingle();
    if (restaurant?.id) {
      try {
        await notifyGiftVoucherRequest({
          restaurantId: restaurant.id as string,
          requestId: String(id),
          requesterName: `${firstName} ${lastName}`.trim(),
          amountHint: (body.amount ?? "").trim() || null,
        });
      } catch (notifyError) {
        console.error("[gift-voucher-notification]", notifyError);
      }
    }

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("gift-voucher route", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur." }, { status: 500 });
  }
}
