import { NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/src/lib/cron-auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { runCompetitorWatchBatch } from "@/src/lib/sharpz/competitor-watch/check";

export const maxDuration = 60;

/**
 * Cron veille concurrents — 1×/jour max.
 * Pages publiques uniquement, erreurs isolées par concurrent.
 */
export async function GET(request: NextRequest) {
  const denied = assertCronAuthorized(request);
  if (denied) return denied;

  const started = Date.now();
  const admin = createAdminClient();
  try {
    const result = await runCompetitorWatchBatch(admin, { limit: 40 });
    console.info("[sharpz-competitor-watch]", {
      status: "ok",
      ...result,
      ms: Date.now() - started,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[sharpz-competitor-watch]", {
      status: "error",
      error: error instanceof Error ? error.message : "unknown",
      ms: Date.now() - started,
    });
    return NextResponse.json({ error: "Veille concurrents impossible." }, { status: 500 });
  }
}

export const POST = GET;
