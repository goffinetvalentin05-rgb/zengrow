import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getPlanFromPriceId, getStripeClient } from "@/src/lib/stripe";
import { createAdminClient } from "@/src/lib/supabase/admin";

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return secret;
}

async function markRestaurantActive(input: {
  restaurantId: string;
  subscriptionId: string;
  customerId: string;
  plan: "starter" | "pro" | null;
}) {
  const supabase = createAdminClient();
  await supabase
    .from("restaurants")
    .update({
      subscription_plan: input.plan,
      subscription_status: "active",
      stripe_customer_id: input.customerId,
      stripe_subscription_id: input.subscriptionId,
    })
    .eq("id", input.restaurantId);
}

async function markSubscriptionStatus(input: {
  subscriptionId: string;
  customerId: string | null;
  plan: "starter" | "pro" | null;
  status: "active" | "expired";
}) {
  const supabase = createAdminClient();
  await supabase
    .from("restaurants")
    .update({
      subscription_plan: input.plan,
      subscription_status: input.status,
      stripe_customer_id: input.customerId,
      stripe_subscription_id: input.subscriptionId,
    })
    .eq("stripe_subscription_id", input.subscriptionId);
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = getWebhookSecret();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signature invalide.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
    const customerId = typeof session.customer === "string" ? session.customer : null;
    const restaurantId = session.metadata?.restaurant_id ?? session.client_reference_id ?? null;
    const planRaw = session.metadata?.selected_plan;
    let plan: "starter" | "pro" | null = planRaw === "starter" || planRaw === "pro" ? planRaw : null;

    if (!plan && session.mode === "subscription" && session.line_items?.data?.length) {
      const priceId = session.line_items.data[0]?.price?.id ?? "";
      plan = getPlanFromPriceId(priceId);
    }

    if (restaurantId && subscriptionId && customerId) {
      await markRestaurantActive({
        restaurantId,
        subscriptionId,
        customerId,
        plan,
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
    const priceId = subscription.items.data[0]?.price?.id ?? "";
    const plan = getPlanFromPriceId(priceId);
    const status =
      subscription.status === "active" || subscription.status === "trialing" ? "active" : "expired";

    await markSubscriptionStatus({
      subscriptionId,
      customerId,
      plan,
      status,
    });
  }

  return NextResponse.json({ received: true });
}
