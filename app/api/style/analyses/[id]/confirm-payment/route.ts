import { after, NextResponse } from "next/server";
import { requireFitmeApiUser } from "@/src/lib/fitme/auth";
import { unlockStyleAnalysisFromStripe } from "@/src/lib/fitme/checkout";
import { jsonError } from "@/src/lib/fitme/http";
import { getAnalysisForUser } from "@/src/lib/fitme/routing";
import { getStripeClient } from "@/src/lib/stripe";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { runClaimedLookGeneration } from "@/src/lib/style-analysis/pipeline";

export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const { id } = await params;
  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("stripe_checkout_session_id, status, stripe_payment_intent_id")
    .eq("analysis_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment?.stripe_checkout_session_id) {
    return jsonError("Aucun paiement à confirmer.", 404);
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(payment.stripe_checkout_session_id);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ ok: true, status: analysis.status, paid: false });
  }

  const result = await unlockStyleAnalysisFromStripe({
    checkoutSessionId: session.id,
    paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : payment.stripe_payment_intent_id,
    userId: user.id,
    analysisId: id,
    amount: session.amount_total,
    currency: session.currency,
  });

  if (result.shouldGenerateLooks) {
    after(() => {
      void runClaimedLookGeneration(id);
    });
  } else if (analysis.status === "generating_looks" || result.ok) {
    after(() => {
      void runClaimedLookGeneration(id);
    });
  }

  return NextResponse.json({ ok: true, paid: true, generating: result.shouldGenerateLooks || analysis.status === "generating_looks" });
}
