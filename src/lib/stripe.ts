import Stripe from "stripe";
import type { SubscriptionPlan } from "@/src/lib/subscription";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export function getPriceIdForPlan(plan: SubscriptionPlan) {
  if (plan === "starter") {
    return process.env.STRIPE_STARTER_PRICE_ID ?? "";
  }
  if (plan === "pro") {
    return process.env.STRIPE_PRO_PRICE_ID ?? "";
  }
  return "";
}

export function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "starter";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  return null;
}
