/**
 * Discovery still calls these helpers. Price and active-plan rules live in
 * src/lib/billing/user-plan.ts so the new app does not depend on Discovery.
 */
import { getLearnProPriceId, isUserProActive, LEARN_PRO_PRICE_AMOUNT, LEARN_PRO_PRICE_LABEL } from "@/src/lib/billing/user-plan";

export const SHARPZ_PRO_PRICE_AMOUNT = LEARN_PRO_PRICE_AMOUNT;
export const SHARPZ_PRO_PRICE_LABEL = LEARN_PRO_PRICE_LABEL;
export const SHARPZ_PRO_PLAN_KEY = "pro" as const;

export function getSharpzProPriceId() {
  return getLearnProPriceId();
}

export function isSharpzProActive(input: {
  plan: "free" | "pro";
  status: "inactive" | "active" | "canceled" | "past_due" | "trialing";
  isOwnerDev?: boolean;
}) {
  if (input.isOwnerDev) return true;
  return isUserProActive(input);
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
