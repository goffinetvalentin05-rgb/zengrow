import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { checkCompetitor, type CompetitorWatchRow } from "@/src/lib/sharpz/competitor-watch/check";
import { buildCompetitorSnapshot } from "@/src/lib/sharpz/competitor-watch/extract";
import { normalizeSaasUrl, WebsiteExtractError } from "@/src/lib/sharpz/website-extract";

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const body = await parseJson<{
    name?: string;
    url?: string;
    pricingUrl?: string | null;
    notes?: string | null;
    positioning?: string;
    pricing?: string;
    runInitialCheck?: boolean;
  }>(request);

  let url: string | null = null;
  if (body?.url?.trim()) {
    try {
      url = normalizeSaasUrl(body.url);
    } catch (error) {
      const message = error instanceof WebsiteExtractError ? error.message : "URL invalide.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  let name = body?.name?.trim() || "";
  let pricingUrl = body?.pricingUrl?.trim() || null;
  let positioning = body?.positioning ?? null;
  let pricing = body?.pricing ?? null;
  let notes = body?.notes?.trim() || null;

  // Enrichissement depuis page publique si URL fournie — jamais inventer pricing_url
  if (url && (!name || body?.runInitialCheck !== false)) {
    try {
      const built = await buildCompetitorSnapshot({ websiteUrl: url, pricingUrl });
      if (!name) name = built.suggestedName || new URL(url).hostname.replace(/^www\./, "");
      if (!pricingUrl) pricingUrl = built.data.pricingUrl;
      if (!positioning) positioning = built.data.hero;
      if (!pricing && built.data.plans.length) {
        pricing = built.data.plans.map((p) => `${p.name}: ${p.price}`).join(" · ").slice(0, 500);
      }
      if (built.fetchStatus !== "ok" && !name) {
        return NextResponse.json(
          { error: built.errorMessage || "Impossible d’accéder à ce site." },
          { status: 400 },
        );
      }
    } catch (error) {
      if (!name) {
        const message = error instanceof WebsiteExtractError ? error.message : "Impossible d’accéder à ce site.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }
  }

  if (!name) return NextResponse.json({ error: "Nom ou URL requis." }, { status: 400 });

  const { data, error } = await supabase
    .from("competitors")
    .insert({
      restaurant_id: restaurant.id,
      name,
      url,
      pricing_url: pricingUrl,
      positioning,
      pricing,
      notes,
      status: "watching",
      active: true,
      last_checked_at: null,
    })
    .select("id, name, url, pricing_url, positioning, pricing, notes, active, status, last_checked_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Impossible d’ajouter le concurrent." }, { status: 400 });
  }

  let check = null;
  if (url) {
    const row: CompetitorWatchRow = {
      id: String(data.id),
      name: String(data.name),
      url: data.url ?? null,
      pricing_url: data.pricing_url ?? null,
      positioning: data.positioning ?? null,
      pricing: data.pricing ?? null,
      notes: data.notes ?? null,
      active: data.active !== false,
      status: String(data.status ?? "watching"),
      last_checked_at: data.last_checked_at ?? null,
    };
    check = await checkCompetitor(supabase, restaurant.id, row);
  }

  return NextResponse.json({ id: data.id, check });
}
