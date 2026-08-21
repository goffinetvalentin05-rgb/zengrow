import { STYLE_PROFILE_PRICE, STYLE_PROFILE_PRODUCT } from "@/src/lib/fitme/constants";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { claimLookGeneration } from "@/src/lib/style-analysis/pipeline";
import { parseStoredResult } from "@/src/lib/style-analysis/serialize";

export function isFitmeDevUnlockEnabled(env: NodeJS.ProcessEnv = process.env) {
  if (env.VERCEL_ENV === "production") return false;
  if (env.NODE_ENV === "production") return false;
  return true;
}

export async function unlockStyleAnalysisForLocalTest(input: { userId: string; analysisId: string }) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("style_analyses")
    .select("*")
    .eq("id", input.analysisId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (!data) return { ok: false as const, error: "Analyse introuvable.", shouldGenerateLooks: false };
  if (data.user_id !== input.userId) {
    return { ok: false as const, error: "Propriétaire invalide.", shouldGenerateLooks: false };
  }

  if (data.payment_status === "paid" && data.is_unlocked) {
    if (data.status === "completed") {
      return { ok: true as const, alreadyPaid: true, shouldGenerateLooks: false, status: data.status as string };
    }
    const claimed = await claimLookGeneration(input.analysisId);
    return {
      ok: true as const,
      alreadyPaid: true,
      shouldGenerateLooks: claimed.claimed,
      status: "generating_looks",
    };
  }

  if (!parseStoredResult(data)) {
    return { ok: false as const, error: "Analyse incomplète. Relancez d’abord l’analyse.", shouldGenerateLooks: false };
  }

  await admin.from("payments").insert({
    user_id: input.userId,
    analysis_id: input.analysisId,
    stripe_checkout_session_id: `dev_local_${input.analysisId}_${Date.now()}`,
    amount: 0,
    currency: STYLE_PROFILE_PRICE.currency,
    status: "paid",
    product_type: STYLE_PROFILE_PRODUCT,
  });

  const { error } = await admin
    .from("style_analyses")
    .update({
      payment_status: "paid",
      is_unlocked: true,
      status: "paid",
      error_message: null,
    })
    .eq("id", input.analysisId)
    .eq("user_id", input.userId)
    .neq("status", "completed");

  if (error) return { ok: false as const, error: error.message, shouldGenerateLooks: false };

  const claimed = await claimLookGeneration(input.analysisId);
  return {
    ok: true as const,
    alreadyPaid: false,
    shouldGenerateLooks: claimed.claimed,
    status: "paid",
  };
}
