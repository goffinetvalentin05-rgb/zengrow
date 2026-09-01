/**
 * Sharpz Pro — price is configured here so it is easy to change
 * without hunting through UI copy.
 *
 * Stripe: set STRIPE_SHARPZ_PRO_PRICE_ID (preferred) in env.
 * Fallback: STRIPE_PRO_PRICE_ID (legacy restaurant Pro — do not assume the amount).
 */
export const SHARPZ_PRO_PRICE_AMOUNT = 9.9;
export const SHARPZ_PRO_PRICE_LABEL = "€9.90 / month";
export const SHARPZ_PRO_PLAN_KEY = "pro" as const;

export function getSharpzProPriceId() {
  return process.env.STRIPE_SHARPZ_PRO_PRICE_ID?.trim() || process.env.STRIPE_PRO_PRICE_ID?.trim() || "";
}

export function isSharpzProActive(input: {
  plan: "free" | "pro";
  status: "inactive" | "active" | "canceled" | "past_due" | "trialing";
  isOwnerDev?: boolean;
}) {
  if (input.isOwnerDev) return true;
  return input.plan === "pro" && (input.status === "active" || input.status === "trialing");
}

/** Gating point for discovery analytics. Full dashboard is Pro; owner/dev is never blocked. */
export type DiscoveryAnalyticsTier = "full" | "limited";

export function discoveryAnalyticsTier(input: {
  plan: "free" | "pro";
  status: "inactive" | "active" | "canceled" | "past_due" | "trialing";
  isOwnerDev?: boolean;
}): DiscoveryAnalyticsTier {
  return isSharpzProActive(input) ? "full" : "limited";
}

export function discoveryHasPro(input: {
  plan: "free" | "pro";
  status: "inactive" | "active" | "canceled" | "past_due" | "trialing";
  isOwnerDev?: boolean;
}) {
  return isSharpzProActive(input);
}
