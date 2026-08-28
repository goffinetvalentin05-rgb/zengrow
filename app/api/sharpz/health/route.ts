import { NextResponse } from "next/server";
import { requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { resolveProspectSearchProvider } from "@/src/lib/sharpz/prospect-search/providers";

/**
 * Readiness Sharpz — config only, aucun appel réseau coûteux.
 * Auth session requise (pas d’exposition publique des flags d’intégration).
 */
export async function GET() {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;

  const search = resolveProspectSearchProvider();
  const openai = Boolean(process.env.OPENAI_API_KEY?.trim());
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );

  const payload = {
    status: supabaseConfigured && openai ? "ok" : "degraded",
    openai,
    supabase: supabaseConfigured,
    searchProvider: search?.name ?? null,
    cronConfigured: Boolean(process.env.CRON_SECRET?.trim()),
  } as const;

  console.info("[sharpz-health]", {
    status: payload.status,
    openai: payload.openai,
    searchProvider: payload.searchProvider,
    cronConfigured: payload.cronConfigured,
    restaurantId: session.restaurant.id,
  });

  return NextResponse.json(payload);
}
