import { NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/src/lib/cron-auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { syncGrowthNotificationsForRestaurant } from "@/src/lib/sharpz/growth-notifications";

export const maxDuration = 60;

/**
 * Cron Growth notifications (Vercel Cron).
 * Proactif : ne dépend pas de l’ouverture du Dashboard.
 */
export async function GET(request: NextRequest) {
  const denied = assertCronAuthorized(request);
  if (denied) return denied;

  const started = Date.now();
  const admin = createAdminClient();
  const { data: restaurants, error } = await admin.from("restaurants").select("id").limit(500);

  if (error) {
    console.error("[sharpz-growth-notifications]", { status: "error", error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let processed = 0;
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const restaurant of restaurants ?? []) {
    try {
      const result = await syncGrowthNotificationsForRestaurant(admin, restaurant.id);
      processed += 1;
      created += result.created;
      skipped += result.skipped;
      errors += result.errors;
    } catch (err) {
      errors += 1;
      console.error("[sharpz-growth-notifications]", {
        status: "tenant_error",
        restaurantId: restaurant.id,
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  console.info("[sharpz-growth-notifications]", {
    status: "ok",
    processed,
    created,
    skipped,
    errors,
    ms: Date.now() - started,
  });

  return NextResponse.json({ ok: true, processed, created, skipped, errors });
}

export const POST = GET;
