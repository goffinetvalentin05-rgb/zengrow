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

function periodEnd(subscription: Stripe.Subscription) {
  const raw = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  return typeof raw === "number" ? raw : null;
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

async function markRestaurantSubscriptionStatus(input: {
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

async function markDiscoverySubscription(input: {
  userId?: string | null;
  subscriptionId: string;
  customerId: string | null;
  status: "active" | "canceled" | "past_due" | "inactive";
  periodEnd?: number | null;
}) {
  const supabase = createAdminClient();
  const patch = {
    plan: (input.status === "active" ? "pro" : "free") as "pro" | "free",
    status: input.status,
    stripe_customer_id: input.customerId,
    stripe_subscription_id: input.subscriptionId,
    current_period_end: input.periodEnd ? new Date(input.periodEnd * 1000).toISOString() : null,
  };
  if (input.userId) {
    await supabase.from("user_subscriptions").upsert({ user_id: input.userId, ...patch }, { onConflict: "user_id" });
    return;
  }
  await supabase.from("user_subscriptions").update(patch).eq("stripe_subscription_id", input.subscriptionId);
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
    const product = session.metadata?.product;
    const userId = session.metadata?.user_id ?? null;

    if (product === "sharpz_discovery" && subscriptionId && customerId && userId) {
      await markDiscoverySubscription({
        userId,
        subscriptionId,
        customerId,
        status: "active",
      });
    } else {
      const restaurantId = session.metadata?.restaurant_id ?? session.client_reference_id ?? null;
      const planRaw = session.metadata?.selected_plan;
      let plan: "starter" | "pro" | null = planRaw === "starter" || planRaw === "pro" ? planRaw : null;
      if (!plan && session.mode === "subscription" && session.line_items?.data?.length) {
        const priceId = session.line_items.data[0]?.price?.id ?? "";
        plan = getPlanFromPriceId(priceId);
      }
      if (restaurantId && subscriptionId && customerId) {
        await markRestaurantActive({ restaurantId, subscriptionId, customerId, plan });
      }
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
    const product = subscription.metadata?.product;
    const userId = subscription.metadata?.user_id ?? null;
    const mapped =
      subscription.status === "active" || subscription.status === "trialing"
        ? "active"
        : subscription.status === "past_due"
          ? "past_due"
          : subscription.status === "canceled"
            ? "canceled"
            : "inactive";

    if (product === "sharpz_discovery" || userId) {
      await markDiscoverySubscription({
        userId,
        subscriptionId,
        customerId,
        status: mapped,
        periodEnd: periodEnd(subscription),
      });
    } else {
      const priceId = subscription.items.data[0]?.price?.id ?? "";
      const plan = getPlanFromPriceId(priceId);
      const status =
        subscription.status === "active" || subscription.status === "trialing" ? "active" : "expired";
      await markRestaurantSubscriptionStatus({ subscriptionId, customerId, plan, status });
    }
  }

  return NextResponse.json({ received: true });
}
