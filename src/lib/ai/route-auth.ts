import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AIAccessDeniedError, assertAIAccess } from "@/src/lib/ai/access";
import { AIConfigurationError, assertOpenAIConfigured } from "@/src/lib/ai/openai";
import { AIUsageLimitError, checkAIUsageLimit, logAIUsage } from "@/src/lib/ai/usage";
import type { AIFeature } from "@/src/lib/ai/types";
import { isRestaurantExpiredForUser } from "@/src/lib/access";
import { expireTrialIfNeeded } from "@/src/lib/subscription";
import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";

export const MAX_REVIEW_TEXT_LENGTH = 3000;
export const MAX_FEEDBACK_TEXT_LENGTH = 3000;
export const MAX_CAMPAIGN_FIELD_LENGTH = 500;
export const MAX_CAMPAIGN_OBJECTIVE_LENGTH = 800;

type RestaurantRow = {
  id: string;
  name: string;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  trial_end_date: string | null;
  stripe_subscription_id: string | null;
};

export async function getAuthenticatedUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null as User | null, error: NextResponse.json({ error: "Non autorisé." }, { status: 401 }) };
  }

  return { user, error: null };
}

export async function verifyRestaurantAccess(
  supabase: SupabaseClient,
  user: User,
  restaurantId: string,
) {
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select(
      "id, name, owner_id, subscription_plan, subscription_status, trial_end_date, stripe_subscription_id",
    )
    .eq("id", restaurantId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !restaurant) {
    return {
      restaurant: null as RestaurantRow | null,
      error: NextResponse.json({ error: "Restaurant introuvable." }, { status: 404 }),
    };
  }

  const synced = await expireTrialIfNeeded(supabase, restaurant);
  const merged = { ...restaurant, ...synced } as RestaurantRow;

  if (isRestaurantExpiredForUser(user.email, merged)) {
    return {
      restaurant: null,
      error: NextResponse.json(
        { error: "Abonnement expiré. Mettez à jour votre formule." },
        { status: 402 },
      ),
    };
  }

  return { restaurant: merged, error: null };
}

export function parseJsonBody<T>(body: unknown): T | null {
  if (body == null || typeof body !== "object") return null;
  return body as T;
}

export function truncateInput(value: string, max: number) {
  return value.trim().slice(0, max);
}

export function aiErrorResponse(error: unknown) {
  if (error instanceof AIAccessDeniedError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof AIConfigurationError) {
    return NextResponse.json(
      { error: "Le service IA n'est pas disponible pour le moment. Réessayez plus tard." },
      { status: 503 },
    );
  }

  if (error instanceof AIUsageLimitError) {
    return NextResponse.json({ error: error.message }, { status: 429 });
  }

  console.error("[ai]", error);
  return NextResponse.json(
    { error: "Une erreur est survenue lors de la génération. Réessayez dans un instant." },
    { status: 500 },
  );
}

type RunAIGenerationParams = {
  supabase: SupabaseClient;
  user: User;
  restaurant: RestaurantRow;
  feature: AIFeature;
  input?: string | null;
  output?: string | null;
  model?: string | null;
  generate: () => Promise<unknown>;
};

export async function runAIGeneration({
  supabase,
  user,
  restaurant,
  feature,
  input,
  output,
  model,
  generate,
}: RunAIGenerationParams) {
  assertOpenAIConfigured();
  assertAIAccess(restaurant.subscription_plan, restaurant.subscription_status);
  await checkAIUsageLimit(
    supabase,
    restaurant.id,
    restaurant.subscription_status,
    restaurant.subscription_plan,
    feature,
  );

  const result = await generate();

  let outputText = output ?? null;
  let modelName = model ?? null;

  if (result && typeof result === "object") {
    const r = result as Record<string, unknown>;
    if (typeof r.text === "string") outputText = r.text;
    if (typeof r.model === "string") modelName = r.model;
    if (typeof r.raw === "string") outputText = r.raw;
    if (r.data != null) outputText = JSON.stringify(r.data);
  }

  await logAIUsage({
    supabase,
    restaurantId: restaurant.id,
    userId: user.id,
    feature,
    input,
    output: outputText,
    model: modelName,
  });

  return result;
}
