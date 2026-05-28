import type { SupabaseClient } from "@supabase/supabase-js";
import type { AIFeature } from "@/src/lib/ai/types";
import { AIAccessDeniedError } from "@/src/lib/ai/access";
import { getAIUsageLimit } from "@/src/lib/ai/limits";
import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";
import { startOfBusinessYmdAsUtcIso, monthBoundsInBusinessTz } from "@/src/lib/date/business-calendar";

export class AIUsageLimitError extends Error {
  constructor(
    message = "Votre limite IA mensuelle est atteinte. Passez à un plan supérieur ou réessayez le mois prochain.",
  ) {
    super(message);
    this.name = "AIUsageLimitError";
  }
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

export function resolveAIUsageQuota(
  subscriptionStatus: SubscriptionStatus,
  subscriptionPlan: SubscriptionPlan | string | null | undefined,
  userEmail?: string | null,
) {
  const { limit, canAccess, isFounder, tier } = getAIUsageLimit({
    plan: subscriptionPlan,
    status: subscriptionStatus,
    userEmail,
  });

  return { limit, canAccess, isFounder, tier };
}

export async function checkAIUsageLimit(
  supabase: SupabaseClient,
  restaurantId: string,
  subscriptionStatus: SubscriptionStatus,
  subscriptionPlan: SubscriptionPlan | string | null | undefined,
  userEmail?: string | null,
  _feature?: AIFeature,
) {
  const { limit, canAccess } = resolveAIUsageQuota(subscriptionStatus, subscriptionPlan, userEmail);

  if (!canAccess) {
    throw new AIAccessDeniedError();
  }

  const used = await countAIUsageThisMonth(supabase, restaurantId);

  if (limit > 0 && used >= limit) {
    throw new AIUsageLimitError();
  }

  return { used, limit, remaining: Math.max(0, limit - used) };
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
