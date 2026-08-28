import { NextResponse } from "next/server";
import { requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { getLatestAudit, getObjectives, getChannels, getUserSaas } from "@/src/lib/sharpz/queries";
import { extractWebsite } from "@/src/lib/sharpz/website-extract";
import { enrichScanWithAI, scanFromExtractOnly } from "@/src/lib/sharpz/scan";
import { buildWorkspaceInsights, persistInsights } from "@/src/lib/sharpz/insights";
import { runAIGeneration } from "@/src/lib/ai/route-auth";

export async function POST() {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, user, restaurant } = session;

  const [saas, objectives, channels, lastAudit] = await Promise.all([
    getUserSaas(supabase, restaurant.id),
    getObjectives(supabase, restaurant.id),
    getChannels(supabase, restaurant.id),
    getLatestAudit(supabase, restaurant.id),
  ]);

  if (!saas?.url) {
    return NextResponse.json(
      { error: "Ajoutez l’URL de votre SaaS avant de lancer une analyse." },
      { status: 422 },
    );
  }

  try {
    const extract = await extractWebsite(saas.url);
    const scan = await enrichScanWithAI(extract).catch(() => scanFromExtractOnly(extract));
    const primary = objectives.find((item) => item.isPrimary)?.key ?? null;
    const insightInput = {
      saasName: saas.name || restaurant.name,
      url: saas.url,
      description: saas.description ?? null,
      stage: saas.stage ?? null,
      primaryObjective: primary,
      extraObjectives: objectives.filter((item) => !item.isPrimary).map((item) => item.key),
      channels: channels.map((item) => item.channel),
      scan,
      locale: "fr" as const,
    };
    const bundle = (await runAIGeneration({
      supabase,
      user,
      restaurant,
      feature: "sharpz_audit",
      input: JSON.stringify(insightInput),
      generate: () => buildWorkspaceInsights(insightInput),
    })) as Awaited<ReturnType<typeof buildWorkspaceInsights>>;

    const auditId = await persistInsights(
      supabase,
      restaurant.id,
      bundle,
      saas.url,
      lastAudit?.globalScore ?? null,
    );

    return NextResponse.json({ ok: true, auditId });
  } catch (error) {
    console.error("[sharpz:audit]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "L’analyse n’a pas pu être produite. Aucun résultat simulé n’a été enregistré.",
      },
      { status: 503 },
    );
  }
}
