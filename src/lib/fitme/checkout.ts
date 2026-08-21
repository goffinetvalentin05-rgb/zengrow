import { STYLE_PROFILE_PRICE, STYLE_PROFILE_PRODUCT } from "@/src/lib/fitme/constants";
import { getStripeClient } from "@/src/lib/stripe";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { claimLookGeneration } from "@/src/lib/style-analysis/pipeline";

function amountsMatch(received: number | null | undefined, expected: number) {
  return typeof received === "number" && received === expected;
}

export async function findReusableCheckoutUrl(analysisId: string, userId: string) {
  const admin = createAdminClient();
  const stripe = getStripeClient();
  const { data: rows } = await admin
    .from("payments")
    .select("stripe_checkout_session_id, status")
    .eq("analysis_id", analysisId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  for (const row of rows ?? []) {
    const sessionId = row.stripe_checkout_session_id as string | null;
    if (!sessionId) continue;
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.status === "open" && session.url) {
        return { url: session.url, sessionId: session.id };
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function createStyleProfileCheckout(input: {
  userId: string;
  email?: string | null;
  analysisId: string;
  origin: string;
}) {
  const reusable = await findReusableCheckoutUrl(input.analysisId, input.userId);
  if (reusable) return reusable;

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
            description: "Styles, palette personnelle et look recommandé.",
          },
        },
      },
    ],
    success_url: `${input.origin}/payment/success?analysis_id=${input.analysisId}`,
    cancel_url: `${input.origin}/analysis/${input.analysisId}/preview?canceled=1`,
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
  await admin
    .from("style_analyses")
    .update({ payment_status: "pending", status: "awaiting_payment" })
    .eq("id", input.analysisId)
    .eq("user_id", input.userId)
    .in("status", ["preview_ready", "awaiting_payment"]);

  const { error } = await admin.from("payments").insert({
    user_id: input.userId,
    analysis_id: input.analysisId,
    stripe_checkout_session_id: session.id,
    amount: STYLE_PROFILE_PRICE.amount,
    currency: STYLE_PROFILE_PRICE.currency,
    status: "pending",
    product_type: STYLE_PROFILE_PRODUCT,
  });
  if (error && !error.message.toLowerCase().includes("duplicate")) {
    console.error("[fitme] payment row:", error.message);
  }

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
  if (!input.analysisId) return { ok: false as const, error: "analysis_id manquant", shouldGenerateLooks: false };

  const admin = createAdminClient();
  const { data: analysis } = await admin
    .from("style_analyses")
    .select("id, user_id, status, payment_status, is_unlocked")
    .eq("id", input.analysisId)
    .maybeSingle();

  if (!analysis) return { ok: false as const, error: "Analyse introuvable", shouldGenerateLooks: false };

  const userId = input.userId ?? (analysis.user_id as string | undefined) ?? null;
  if (!userId) return { ok: false as const, error: "user_id manquant", shouldGenerateLooks: false };
  if (analysis.user_id !== userId) {
    return { ok: false as const, error: "Propriétaire invalide", shouldGenerateLooks: false };
  }

  const expectedAmount = STYLE_PROFILE_PRICE.amount;
  const expectedCurrency = STYLE_PROFILE_PRICE.currency;
  if (input.amount != null && !amountsMatch(input.amount, expectedAmount)) {
    console.error("[fitme] amount mismatch", { received: input.amount, expected: expectedAmount });
    return { ok: false as const, error: "Montant invalide", shouldGenerateLooks: false };
  }
  if (input.currency && input.currency.toLowerCase() !== expectedCurrency) {
    console.error("[fitme] currency mismatch", { received: input.currency, expected: expectedCurrency });
    return { ok: false as const, error: "Devise invalide", shouldGenerateLooks: false };
  }

  const { data: existing } = await admin
    .from("payments")
    .select("id, status")
    .eq("stripe_checkout_session_id", input.checkoutSessionId)
    .maybeSingle();

  if (existing?.status === "paid") {
    const claimed = await claimLookGeneration(input.analysisId);
    return {
      ok: true as const,
      idempotent: true,
      shouldGenerateLooks: claimed.claimed,
    };
  }

  if (existing?.id) {
    await admin
      .from("payments")
      .update({
        status: "paid",
        stripe_payment_intent_id: input.paymentIntentId ?? null,
        amount: input.amount ?? expectedAmount,
        currency: (input.currency ?? expectedCurrency).toLowerCase(),
      })
      .eq("id", existing.id);
  } else {
    await admin.from("payments").insert({
      user_id: userId,
      analysis_id: input.analysisId,
      stripe_checkout_session_id: input.checkoutSessionId,
      stripe_payment_intent_id: input.paymentIntentId ?? null,
      amount: input.amount ?? expectedAmount,
      currency: (input.currency ?? expectedCurrency).toLowerCase(),
      status: "paid",
      product_type: STYLE_PROFILE_PRODUCT,
    });
  }

  const { error } = await admin
    .from("style_analyses")
    .update({
      payment_status: "paid",
      is_unlocked: true,
      status: "paid",
    })
    .eq("id", input.analysisId)
    .eq("user_id", userId)
    .neq("status", "completed");

  if (error) return { ok: false as const, error: error.message, shouldGenerateLooks: false };

  const claimed = await claimLookGeneration(input.analysisId);
  return {
    ok: true as const,
    idempotent: false,
    shouldGenerateLooks: claimed.claimed,
  };
}
