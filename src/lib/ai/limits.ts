import { isOwnerEmail } from "@/src/lib/access";
import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";

/** Plans normalisés (valeurs internes, pas les libellés UI). */
export type NormalizedBillingPlan = "essential" | "pro" | "growth" | "unknown";

export type AIUsageLimitTier = "founder" | "trial" | "pro" | "growth" | "essential";

export const AI_LIMIT_FOUNDER = 10_000;
export const AI_LIMIT_PRO = 150;
export const AI_LIMIT_GROWTH = 500;
export const AI_LIMIT_TRIAL = 150;

export type AIUsageLimitResult = {
  limit: number;
  canAccess: boolean;
  isFounder: boolean;
  tier: AIUsageLimitTier;
  normalizedPlan: NormalizedBillingPlan;
};

function founderEmailSet(): Set<string> {
  const fromEnv =
    process.env.FOUNDER_EMAILS?.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean) ?? [];
  return new Set(fromEnv);
}

/** Compte fondateur / admin SaaS — jamais exposé côté client. */
export function isFounderEmail(email?: string | null): boolean {
  if (!email?.trim()) return false;
  const normalized = email.trim().toLowerCase();
  if (isOwnerEmail(normalized)) return true;
  return founderEmailSet().has(normalized);
}

/**
 * Normalise subscription_plan (DB / Stripe) vers un plan interne stable.
 * Ne pas comparer aux libellés affichés (« Plan Pro », etc.).
 */
export function normalizeSubscriptionPlan(
  plan: SubscriptionPlan | string | null | undefined,
): NormalizedBillingPlan {
  const raw = String(plan ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if (!raw) return "unknown";

  if (raw === "pro" || raw === "plan_pro" || raw === "plan_69" || raw === "69") {
    return "pro";
  }

  if (
    raw === "growth" ||
    raw === "premium" ||
    raw === "plan_growth" ||
    raw === "plan_89" ||
    raw === "plan_premium" ||
    raw === "89"
  ) {
    return "growth";
  }

  if (
    raw === "starter" ||
    raw === "essential" ||
    raw === "basic" ||
    raw === "plan_starter" ||
    raw === "plan_essential" ||
    raw === "plan_49" ||
    raw === "49"
  ) {
    return "essential";
  }

  return "unknown";
}

type GetAIUsageLimitInput = {
  plan: SubscriptionPlan | string | null | undefined;
  status: SubscriptionStatus;
  userEmail?: string | null;
};

/**
 * Source unique des limites et de l'accès IA (API + affichage dashboard).
 */
export function getAIUsageLimit({
  plan,
  status,
  userEmail,
}: GetAIUsageLimitInput): AIUsageLimitResult {
  if (isFounderEmail(userEmail)) {
    return {
      limit: AI_LIMIT_FOUNDER,
      canAccess: true,
      isFounder: true,
      tier: "founder",
      normalizedPlan: "pro",
    };
  }

  if (status === "trial") {
    return {
      limit: AI_LIMIT_TRIAL,
      canAccess: true,
      isFounder: false,
      tier: "trial",
      normalizedPlan: normalizeSubscriptionPlan(plan),
    };
  }

  const normalizedPlan = normalizeSubscriptionPlan(plan);

  if (normalizedPlan === "pro") {
    return {
      limit: AI_LIMIT_PRO,
      canAccess: true,
      isFounder: false,
      tier: "pro",
      normalizedPlan,
    };
  }

  if (normalizedPlan === "growth") {
    return {
      limit: AI_LIMIT_GROWTH,
      canAccess: true,
      isFounder: false,
      tier: "growth",
      normalizedPlan,
    };
  }

  return {
    limit: 0,
    canAccess: false,
    isFounder: false,
    tier: "essential",
    normalizedPlan: normalizedPlan === "unknown" ? "unknown" : "essential",
  };
}
