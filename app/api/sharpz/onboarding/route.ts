import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import {
  buildWorkspaceInsights,
  ensureIntegrations,
  persistInsights,
  upsertSaasFromOnboarding,
} from "@/src/lib/sharpz/insights";
import type { ScanResult } from "@/src/lib/sharpz/types";
import { runAIGeneration } from "@/src/lib/ai/route-auth";

export const maxDuration = 60;

type Payload = {
  url?: string | null;
  scan?: ScanResult | null;
  pricingSummary?: string | null;
  stage?: string;
  primaryObjective?: string;
  extraObjectives?: string[];
  channels?: string[];
  locale?: "fr" | "en";
};

function publicOnboardingError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const lower = message.toLowerCase();
  if (lower.includes("does not exist") || lower.includes("schema cache") || lower.includes("could not find the table")) {
    return "Le schéma Sharpz n’est pas encore appliqué. Relancez la migration SQL.";
  }
  if (lower.includes("row-level security")) {
    return "Les politiques de sécurité bloquent l’enregistrement. Vérifiez le RLS Sharpz.";
  }
  if (lower.includes("timeout") || lower.includes("aborted")) {
    return "L’analyse a pris trop de temps. Réessayez.";
  }
  return message || "Impossible de préparer vos recommandations.";
}

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, user, restaurant } = session;

  try {
    const body = await parseJson<Payload>(request);
    const stage = body?.stage?.trim() || "mvp";
    const primaryObjective = body?.primaryObjective?.trim() || "other";
    const extraObjectives = (body?.extraObjectives ?? []).filter((item) => item && item !== primaryObjective);
    const channels = body?.channels ?? [];
    const scan = body?.scan ?? null;
    const url = body?.url ?? scan?.extract.finalUrl ?? null;
    const name = scan?.detected.name || restaurant.name;

    await upsertSaasFromOnboarding(supabase, restaurant.id, {
      scan,
      name,
      url,
      pricingSummary: body?.pricingSummary ?? null,
      stage,
      onboardingCompleted: false,
    });

    const { error: deleteObjectivesError } = await supabase
      .from("user_objectives")
      .delete()
      .eq("restaurant_id", restaurant.id);
    if (deleteObjectivesError) throw new Error(deleteObjectivesError.message);

    const { error: insertObjectivesError } = await supabase.from("user_objectives").insert([
      { restaurant_id: restaurant.id, key: primaryObjective, is_primary: true },
      ...extraObjectives.map((key) => ({ restaurant_id: restaurant.id, key, is_primary: false })),
    ]);
    if (insertObjectivesError) throw new Error(insertObjectivesError.message);

    const { error: deleteChannelsError } = await supabase
      .from("acquisition_channels")
      .delete()
      .eq("restaurant_id", restaurant.id);
    if (deleteChannelsError) throw new Error(deleteChannelsError.message);

    if (channels.length) {
      const { error: insertChannelsError } = await supabase.from("acquisition_channels").insert(
        channels.map((channel) => ({ restaurant_id: restaurant.id, channel })),
      );
      if (insertChannelsError) throw new Error(insertChannelsError.message);
    }

    await ensureIntegrations(supabase, restaurant.id);

    let insightsGenerated = false;
    try {
      const insightInput = {
        saasName: name,
        url,
        description: scan?.detected.description ?? null,
        stage,
        primaryObjective,
        extraObjectives,
        channels,
        scan,
        locale: body?.locale === "en" ? ("en" as const) : ("fr" as const),
      };
      const bundle = (await runAIGeneration({
        supabase,
        user,
        restaurant,
        feature: "sharpz_onboarding",
        input: JSON.stringify(insightInput),
        generate: () => buildWorkspaceInsights(insightInput),
      })) as Awaited<ReturnType<typeof buildWorkspaceInsights>>;

      await persistInsights(supabase, restaurant.id, bundle, url, null);
      insightsGenerated = true;
    } catch (error) {
      console.error("[sharpz:onboarding:insights]", error);
    }

    const { error: completeError } = await supabase
      .from("user_saas")
      .update({
        onboarding_completed: true,
        onboarding_step: "done",
      })
      .eq("restaurant_id", restaurant.id);
    if (completeError) throw new Error(completeError.message);

    return NextResponse.json({
      ok: true,
      insightsGenerated,
      warning: insightsGenerated
        ? null
        : "Votre profil est enregistré, mais l’analyse IA n’a pas pu être produite. Aucun résultat simulé n’a été créé.",
    });
  } catch (error) {
    console.error("[sharpz:onboarding]", error);
    return NextResponse.json({ error: publicOnboardingError(error) }, { status: 500 });
  }
}
