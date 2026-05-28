import type { SupabaseClient } from "@supabase/supabase-js";
import type { AIFeature, AIPlanTier } from "@/src/lib/ai/types";
import { AIAccessDeniedError, canAccessAI } from "@/src/lib/ai/access";
import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";
import { startOfBusinessYmdAsUtcIso } from "@/src/lib/date/business-calendar";
import { monthBoundsInBusinessTz } from "@/src/lib/date/business-calendar";

export const AI_MONTHLY_LIMITS: Record<AIPlanTier, number> = {
  trial: 10,
  basic: 30,
  pro: 150,
  premium: 500,
};

export class AIUsageLimitError extends Error {
  constructor(
    message = "Votre limite IA mensuelle est atteinte. Passez à un plan supérieur ou réessayez le mois prochain.",
  ) {
    super(message);
    this.name = "AIUsageLimitError";
  }
}

export function resolveAIPlanTier(
  subscriptionStatus: SubscriptionStatus,
  subscriptionPlan: SubscriptionPlan,
): AIPlanTier {
  if (subscriptionStatus === "trial") {
    return "trial";
  }
  if (subscriptionPlan === "pro") {
    return "pro";
  }
  if (subscriptionPlan === "starter") {
    return "basic";
  }
  return "basic";
}

export function getAIMonthlyLimit(
  subscriptionStatus: SubscriptionStatus,
  subscriptionPlan: SubscriptionPlan,
) {
  if (!canAccessAI(subscriptionPlan, subscriptionStatus)) {
    return 0;
  }
  const tier = resolveAIPlanTier(subscriptionStatus, subscriptionPlan);
  return AI_MONTHLY_LIMITS[tier];
}

function currentMonthStartIso() {
  const { startYmd } = monthBoundsInBusinessTz(new Date());
  return startOfBusinessYmdAsUtcIso(startYmd);
}

export async function countAIUsageThisMonth(supabase: SupabaseClient, restaurantId: string) {
  const monthStart = currentMonthStartIso();

  const { count, error } = await supabase
    .from("ai_usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .gte("created_at", monthStart);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function checkAIUsageLimit(
  supabase: SupabaseClient,
  restaurantId: string,
  subscriptionStatus: SubscriptionStatus,
  subscriptionPlan: SubscriptionPlan,
  _feature?: AIFeature,
) {
  if (!canAccessAI(subscriptionPlan, subscriptionStatus)) {
    throw new AIAccessDeniedError();
  }

  const limit = getAIMonthlyLimit(subscriptionStatus, subscriptionPlan);
  const used = await countAIUsageThisMonth(supabase, restaurantId);

  if (used >= limit) {
    throw new AIUsageLimitError();
  }

  return { used, limit, remaining: limit - used };
}

type LogAIUsageParams = {
  supabase: SupabaseClient;
  restaurantId: string;
  userId: string | null;
  feature: AIFeature;
  input?: string | null;
  output?: string | null;
  model?: string | null;
};

export async function logAIUsage({
  supabase,
  restaurantId,
  userId,
  feature,
  input,
  output,
  model,
}: LogAIUsageParams) {
  const { error } = await supabase.from("ai_usage_logs").insert({
    restaurant_id: restaurantId,
    user_id: userId,
    feature,
    model: model ?? null,
    input_text: input ?? null,
    output_text: output ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
