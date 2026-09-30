import { NextResponse } from "next/server";
import { requireRestaurant, requireUser } from "@/src/lib/auth";
import { getPriceIdForPlan, getStripeClient } from "@/src/lib/stripe";
import { createClient } from "@/src/lib/supabase/server";

type Payload = {
  plan?: "starter" | "pro";
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Payload;
  const selectedPlan = payload.plan;

  if (selectedPlan !== "starter" && selectedPlan !== "pro") {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  const supabase = await createClient();
  const [user, restaurant] = await Promise.all([requireUser(), requireRestaurant()]);
  const stripe = getStripeClient();
  const priceId = getPriceIdForPlan(selectedPlan);

  if (!priceId) {
    return NextResponse.json(
      { error: "Prix Stripe non configuré. Vérifiez STRIPE_STARTER_PRICE_ID / STRIPE_PRO_PRICE_ID." },
      { status: 500 },
    );
  }

  let stripeCustomerId = restaurant.stripe_customer_id;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: restaurant.name,
      metadata: {
        restaurant_id: restaurant.id,
        owner_id: user.id,
      },
    });

    stripeCustomerId = customer.id;
    await supabase
      .from("restaurants")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", restaurant.id);
  }

  const origin = new URL(request.url).origin;
  const trialEndDateMs = restaurant.trial_end_date ? new Date(restaurant.trial_end_date).getTime() : null;
  const isTrialStillActive = trialEndDateMs ? trialEndDateMs > Date.now() : false;
  const trialEndSeconds = trialEndDateMs ? Math.floor(trialEndDateMs / 1000) : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard`,
    cancel_url: `${origin}/dashboard/billing?cancelled=1`,
    client_reference_id: restaurant.id,
    metadata: {
      restaurant_id: restaurant.id,
      owner_id: user.id,
      selected_plan: selectedPlan,
    },
    subscription_data: {
      metadata: {
        restaurant_id: restaurant.id,
        owner_id: user.id,
        selected_plan: selectedPlan,
      },
      ...(restaurant.subscription_status === "trial" && isTrialStillActive && trialEndSeconds
        ? { trial_end: trialEndSeconds }
        : {}),
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Impossible de créer la session de paiement." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
