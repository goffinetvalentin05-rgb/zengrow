import { NextResponse } from "next/server";
import { requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { syncGrowthNotificationsForRestaurant } from "@/src/lib/sharpz/growth-notifications";

/**
 * Sync notifications Growth pour le restaurant authentifié (idempotent via dedup_key).
 * Appelé au chargement Dashboard / cloche — pas de fake, pas de spam.
 */
export async function POST() {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;

  try {
    const result = await syncGrowthNotificationsForRestaurant(supabase, restaurant.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[growth-notifications-sync]", error);
    return NextResponse.json({ error: "Sync notifications impossible." }, { status: 500 });
  }
}
