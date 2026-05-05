import { createAdminClient } from "@/src/lib/supabase/admin";
import {
  canAccessFeature,
  isRestaurantExpired,
  type FeatureKey,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from "@/src/lib/subscription";

/** Comptes propriétaire / développement : accès Pro effectif sans Stripe (e-mail auth Supabase uniquement). */
export const OWNER_EMAILS: readonly string[] = ["goffinetvalentin05@gmail.com"];

const OWNER_EMAIL_SET = new Set(OWNER_EMAILS.map((e) => e.toLowerCase()));

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return OWNER_EMAIL_SET.has(email.trim().toLowerCase());
}

export type EffectiveAccess = {
  isOwnerDev: boolean;
  effectivePlan: SubscriptionPlan;
  effectiveStatus: SubscriptionStatus;
  canUseProFeatures: boolean;
  hasDashboardAccess: boolean;
};

type RestaurantAccessInput = {
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  trial_end_date: string | null;
  stripe_subscription_id: string | null;
};

export function getEffectiveAccessState(
  userEmail: string | null | undefined,
  restaurant: RestaurantAccessInput,
): EffectiveAccess {
  if (isOwnerEmail(userEmail)) {
    return {
      isOwnerDev: true,
      effectivePlan: "pro",
      effectiveStatus: "active",
      canUseProFeatures: true,
      hasDashboardAccess: true,
    };
  }

  return {
    isOwnerDev: false,
    effectivePlan: restaurant.subscription_plan,
    effectiveStatus: restaurant.subscription_status,
    canUseProFeatures:
      restaurant.subscription_status === "trial" || restaurant.subscription_plan === "pro",
    hasDashboardAccess: !isRestaurantExpired(restaurant),
  };
}

export function isRestaurantExpiredForUser(
  userEmail: string | null | undefined,
  restaurant: Parameters<typeof isRestaurantExpired>[0],
): boolean {
  if (isOwnerEmail(userEmail)) return false;
  return isRestaurantExpired(restaurant);
}

export function canAccessFeatureForUser(
  userEmail: string | null | undefined,
  plan: SubscriptionPlan,
  feature: FeatureKey,
  status: SubscriptionStatus = "active",
): boolean {
  if (isOwnerEmail(userEmail)) return true;
  return canAccessFeature(plan, feature, status);
}

/**
 * Réservations publiques : si le restaurant est marqué expiré mais le propriétaire est un compte dev,
 * les réservations restent acceptées (nécessite la clé service Supabase).
 */
export async function devOwnerBypassesPublicBookingBlock(ownerId: string | null | undefined): Promise<boolean> {
  if (!ownerId) return false;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(ownerId);
    if (error || !data.user?.email) return false;
    return isOwnerEmail(data.user.email);
  } catch {
    return false;
  }
}
