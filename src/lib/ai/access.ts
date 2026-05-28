import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";

export class AIAccessDeniedError extends Error {
  constructor(
    message = "Les outils IA sont disponibles avec le plan Pro (69 CHF/mois). Passez au plan Pro pour continuer.",
  ) {
    super(message);
    this.name = "AIAccessDeniedError";
  }
}

/** IA texte : Pro actif ou période d'essai. Pas disponible sur Starter (49 CHF). */
export function canAccessAI(
  plan: SubscriptionPlan,
  status: SubscriptionStatus,
): boolean {
  if (status === "trial") {
    return true;
  }
  return plan === "pro";
}

export function assertAIAccess(plan: SubscriptionPlan, status: SubscriptionStatus) {
  if (!canAccessAI(plan, status)) {
    throw new AIAccessDeniedError();
  }
}
