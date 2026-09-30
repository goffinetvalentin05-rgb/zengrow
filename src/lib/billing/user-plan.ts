export const LEARN_PRO_PRICE_AMOUNT = 9.9;
export const LEARN_PRO_PRICE_LABEL = "€9.90 / month";
export const LEARN_PRODUCT = "learn";
export const LEGACY_DISCOVERY_PRODUCT = "sharpz_discovery";

export type UserPlan = "free" | "pro";
export type UserSubscriptionStatus = "inactive" | "active" | "canceled" | "past_due" | "trialing";

export function getLearnProPriceId() {
  return process.env.STRIPE_SHARPZ_PRO_PRICE_ID?.trim() || process.env.STRIPE_PRO_PRICE_ID?.trim() || "";
}

export function isUserProActive(input: { plan: UserPlan; status: UserSubscriptionStatus }) {
  return input.plan === "pro" && (input.status === "active" || input.status === "trialing");
}

/** Checkout completion: only explicit user products. */
export function isUserCheckoutProduct(product: string | null | undefined) {
  return product === LEARN_PRODUCT || product === LEGACY_DISCOVERY_PRODUCT;
}

/**
 * Subscription updates. Keeps the previous discovery rule (`user_id` present)
 * and accepts the new `learn` product.
 */
export function shouldSyncUserSubscription(input: { product?: string | null; userId?: string | null }) {
  if (input.product === LEARN_PRODUCT || input.product === LEGACY_DISCOVERY_PRODUCT) return true;
  return Boolean(input.userId);
}
