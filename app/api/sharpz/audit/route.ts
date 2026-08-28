import { NextResponse } from "next/server";
import { requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { getLatestAudit, getObjectives, getChannels, getUserSaas } from "@/src/lib/sharpz/queries";
import { extractWebsite } from "@/src/lib/sharpz/website-extract";
import { enrichScanWithAI, scanFromExtractOnly } from "@/src/lib/sharpz/scan";
import { buildWorkspaceInsights, persistInsights } from "@/src/lib/sharpz/insights";

export async function POST() {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;

  const [saas, objectives, channels, lastAudit] = await Promise.all([
    getUserSaas(supabase, restaurant.id),
    getObjectives(supabase, restaurant.id),
    getChannels(supabase, restaurant.id),
    getLatestAudit(supabase, restaurant.id),
  ]);

  let scan = null;
  if (saas?.url) {
    try {
      const extract = await extractWebsite(saas.url);
      try {
        scan = await enrichScanWithAI(extract);
      } catch {
        scan = scanFromExtractOnly(extract);
      }
    } catch {
      scan = null;
    }
  }

  const primary = objectives.find((item) => item.isPrimary)?.key ?? null;
  const bundle = await buildWorkspaceInsights({
    saasName: saas?.name || restaurant.name,
    url: saas?.url ?? null,
    description: saas?.description ?? null,
    stage: saas?.stage ?? null,
    primaryObjective: primary,
    extraObjectives: objectives.filter((item) => !item.isPrimary).map((item) => item.key),
    channels: channels.map((item) => item.channel),
    scan,
    locale: "fr",
  });

  const auditId = await persistInsights(
    supabase,
    restaurant.id,
    bundle,
    saas?.url ?? null,
    lastAudit?.globalScore ?? null,
  );

  return NextResponse.json({ ok: true, auditId });
}
