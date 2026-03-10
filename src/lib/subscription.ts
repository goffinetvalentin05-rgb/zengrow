import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionPlan = "starter" | "pro" | null;
export type SubscriptionStatus = "trial" | "active" | "expired";
export type FeatureKey = "reservations" | "availability" | "reviews" | "feedback" | "customers" | "marketing";

type RestaurantSubscriptionSnapshot = {
  id: string;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  trial_end_date: string | null;
  stripe_subscription_id: string | null;
};

function hasTrialExpired(trialEndDate: string | null) {
  if (!trialEndDate) return false;
  return new Date(trialEndDate).getTime() <= Date.now();
}

export function isRestaurantExpired(restaurant: {
  subscription_status: SubscriptionStatus;
  trial_end_date: string | null;
  stripe_subscription_id: string | null;
}) {
  if (restaurant.subscription_status === "expired") {
    return true;
  }

  if (
    restaurant.subscription_status === "trial" &&
    hasTrialExpired(restaurant.trial_end_date) &&
    !restaurant.stripe_subscription_id
  ) {
    return true;
  }

  return false;
}

export function canAccessFeature(
  plan: SubscriptionPlan,
  feature: FeatureKey,
  status: SubscriptionStatus = "active",
) {
  if (status === "trial") {
    return true;
  }

  if (feature === "marketing") {
    return plan === "pro";
  }

  return true;
}

export async function expireTrialIfNeeded<T extends RestaurantSubscriptionSnapshot>(
  supabase: SupabaseClient,
  restaurant: T,
): Promise<T> {
  if (
    restaurant.subscription_status !== "trial" ||
    !hasTrialExpired(restaurant.trial_end_date) ||
    restaurant.stripe_subscription_id
  ) {
    return restaurant;
  }

  const { data } = await supabase
    .from("restaurants")
    .update({ subscription_status: "expired" })
    .eq("id", restaurant.id)
    .select("subscription_status")
    .single();

  return {
    ...restaurant,
    subscription_status: (data?.subscription_status ?? "expired") as SubscriptionStatus,
  };
}
