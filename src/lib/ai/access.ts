import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";
import { getAIUsageLimit } from "@/src/lib/ai/limits";

export class AIAccessDeniedError extends Error {
  constructor(
    message = "Les outils IA sont disponibles avec le plan Pro (69 CHF/mois). Passez au plan Pro pour continuer.",
  ) {
    super(message);
    this.name = "AIAccessDeniedError";
  }
}

export function canAccessAI(
  plan: SubscriptionPlan | string | null | undefined,
  status: SubscriptionStatus,
  userEmail?: string | null,
): boolean {
  return getAIUsageLimit({ plan, status, userEmail }).canAccess;
}

export function assertAIAccess(
  plan: SubscriptionPlan | string | null | undefined,
  status: SubscriptionStatus,
  userEmail?: string | null,
) {
  if (!canAccessAI(plan, status, userEmail)) {
    throw new AIAccessDeniedError();
  }
}
