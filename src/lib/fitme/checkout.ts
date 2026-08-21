import { STYLE_PROFILE_PRICE, STYLE_PROFILE_PRODUCT } from "@/src/lib/fitme/constants";
import { getStripeClient } from "@/src/lib/stripe";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function createStyleProfileCheckout(input: {
  userId: string;
  email?: string | null;
  analysisId: string;
  origin: string;
}) {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: STYLE_PROFILE_PRICE.currency,
          unit_amount: STYLE_PROFILE_PRICE.amount,
          product_data: {
            name: "Style Profile",
            description: "Styles, palette personnelle et looks sauvegardés.",
          },
        },
      },
    ],
    success_url: `${input.origin}/payment/success?analysis_id=${input.analysisId}`,
    cancel_url: `${input.origin}/analysis/${input.analysisId}/preview`,
    client_reference_id: input.analysisId,
    metadata: {
      user_id: input.userId,
      analysis_id: input.analysisId,
      product_type: STYLE_PROFILE_PRODUCT,
    },
    payment_intent_data: {
      metadata: {
        user_id: input.userId,
        analysis_id: input.analysisId,
        product_type: STYLE_PROFILE_PRODUCT,
      },
    },
  });

  if (!session.url) {
    throw new Error("Impossible de créer la session de paiement.");
  }

  const admin = createAdminClient();
  await admin.from("style_analyses").update({ payment_status: "pending" }).eq("id", input.analysisId).eq("user_id", input.userId);
  await admin.from("payments").insert({
    user_id: input.userId,
    analysis_id: input.analysisId,
    stripe_checkout_session_id: session.id,
    amount: STYLE_PROFILE_PRICE.amount,
    currency: STYLE_PROFILE_PRICE.currency,
    status: "pending",
    product_type: STYLE_PROFILE_PRODUCT,
  }).then(({ error }) => {
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      console.error("[fitme] payment row:", error.message);
    }
  });

  return { url: session.url, sessionId: session.id };
}

export async function unlockStyleAnalysisFromStripe(input: {
  checkoutSessionId: string;
  paymentIntentId?: string | null;
  userId?: string | null;
  analysisId?: string | null;
  amount?: number | null;
  currency?: string | null;
}) {
  if (!input.analysisId) return { ok: false as const, error: "analysis_id manquant" };

  const admin = createAdminClient();
  const { data: analysis } = await admin
    .from("style_analyses")
    .select("id, user_id")
    .eq("id", input.analysisId)
    .maybeSingle();

  const userId = input.userId ?? (analysis?.user_id as string | undefined) ?? null;
  if (!userId) return { ok: false as const, error: "user_id manquant" };
  const { data: existing } = await admin
    .from("payments")
    .select("id, status")
    .eq("stripe_checkout_session_id", input.checkoutSessionId)
    .maybeSingle();

  if (existing?.status === "paid") {
    await admin
      .from("style_analyses")
      .update({ payment_status: "paid", is_unlocked: true })
      .eq("id", input.analysisId);
    return { ok: true as const, idempotent: true };
  }

  if (existing?.id) {
    await admin
      .from("payments")
      .update({
        status: "paid",
        stripe_payment_intent_id: input.paymentIntentId ?? null,
      })
      .eq("id", existing.id);
  } else {
    await admin.from("payments").insert({
      user_id: userId,
      analysis_id: input.analysisId,
      stripe_checkout_session_id: input.checkoutSessionId,
      stripe_payment_intent_id: input.paymentIntentId ?? null,
      amount: input.amount ?? STYLE_PROFILE_PRICE.amount,
      currency: input.currency ?? STYLE_PROFILE_PRICE.currency,
      status: "paid",
      product_type: STYLE_PROFILE_PRODUCT,
    });
  }

  const { error } = await admin
    .from("style_analyses")
    .update({ payment_status: "paid", is_unlocked: true })
    .eq("id", input.analysisId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, idempotent: false };
}
