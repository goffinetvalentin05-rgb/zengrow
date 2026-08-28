import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildChangeDedupKey,
  diffCompetitorSnapshots,
  type CompetitorSnapshotData,
  type DetectedCompetitorChange,
} from "@/src/lib/sharpz/competitor-watch/diff";
import { buildCompetitorSnapshot } from "@/src/lib/sharpz/competitor-watch/extract";
import { createNotification } from "@/src/lib/notifications/create";
import { analyticsHref } from "@/src/lib/sharpz/routes";

export type CompetitorWatchRow = {
  id: string;
  name: string;
  url: string | null;
  pricing_url: string | null;
  positioning: string | null;
  pricing: string | null;
  notes: string | null;
  active: boolean;
  status: string;
  last_checked_at: string | null;
};

function mapSnapshotRow(row: Record<string, unknown>): CompetitorSnapshotData {
  const plansRaw = Array.isArray(row.plans) ? row.plans : [];
  return {
    title: typeof row.title === "string" ? row.title : null,
    description: typeof row.description === "string" ? row.description : null,
    hero: typeof row.hero === "string" ? row.hero : null,
    cta: typeof row.cta === "string" ? row.cta : null,
    pricingText: typeof row.pricing_text === "string" ? row.pricing_text : null,
    plans: plansRaw
      .map((p) => {
        const item = p as Record<string, unknown>;
        return {
          name: String(item.name ?? ""),
          price: String(item.price ?? ""),
          period: typeof item.period === "string" ? item.period : null,
        };
      })
      .filter((p) => p.price || p.name),
    homepageUrl: typeof row.homepage_url === "string" ? row.homepage_url : null,
    pricingUrl: typeof row.pricing_url === "string" ? row.pricing_url : null,
  };
}

async function getLatestSnapshot(
  supabase: SupabaseClient,
  competitorId: string,
): Promise<{ data: CompetitorSnapshotData; fetchStatus: string } | null> {
  const { data } = await supabase
    .from("competitor_snapshots")
    .select("*")
    .eq("competitor_id", competitorId)
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    data: mapSnapshotRow(data as Record<string, unknown>),
    fetchStatus: String((data as { fetch_status?: string }).fetch_status ?? "ok"),
  };
}

async function persistChanges(
  supabase: SupabaseClient,
  restaurantId: string,
  competitorId: string,
  competitorName: string,
  changes: DetectedCompetitorChange[],
): Promise<{ created: number; skipped: number; ids: string[] }> {
  let created = 0;
  let skipped = 0;
  const ids: string[] = [];

  for (const change of changes) {
    const dedupKey = buildChangeDedupKey({
      competitorId,
      changeType: change.changeType,
      beforeValue: change.beforeValue,
      afterValue: change.afterValue,
    });

    const { data: existing } = await supabase
      .from("competitor_changes")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("dedup_key", dedupKey)
      .maybeSingle();

    if (existing?.id) {
      skipped += 1;
      continue;
    }

    const { data, error } = await supabase
      .from("competitor_changes")
      .insert({
        restaurant_id: restaurantId,
        competitor_id: competitorId,
        change_type: change.changeType,
        what_changed: change.description.slice(0, 500),
        importance: change.importance,
        why_it_matters: change.whyItMatters,
        before_value: change.beforeValue,
        after_value: change.afterValue,
        source_url: change.sourceUrl,
        confidence: change.confidence,
        dedup_key: dedupKey,
        metadata: { title: change.title },
      })
      .select("id")
      .single();

    if (error || !data) {
      if (error?.code === "23505") {
        skipped += 1;
        continue;
      }
      console.error("[competitor-watch] change insert", error?.message);
      continue;
    }

    created += 1;
    ids.push(String(data.id));

    // Notification Growth une fois par change (P0.4 — pas de rewrite système)
    await createNotification({
      restaurantId,
      type: "growth_competitor_change",
      title: change.title,
      message: `${competitorName} — ${change.description}`.slice(0, 500),
      actionUrl: analyticsHref("market"),
      relatedEntityType: "competitor_change",
      relatedEntityId: String(data.id),
      dedupKey: `growth_competitor_change:${data.id}`,
      severity: change.importance === "high" ? "attention" : "info",
    });
  }

  return { created, skipped, ids };
}

export type CheckCompetitorResult = {
  competitorId: string;
  ok: boolean;
  fetchStatus: "ok" | "unavailable" | "error";
  errorMessage: string | null;
  isInitialSnapshot: boolean;
  changesCreated: number;
  changesSkipped: number;
  contentHash: string;
};

/** Vérifie un concurrent : snapshot → diff → changes (idempotent). */
export async function checkCompetitor(
  supabase: SupabaseClient,
  restaurantId: string,
  competitor: CompetitorWatchRow,
): Promise<CheckCompetitorResult> {
  if (!competitor.url?.trim()) {
    await supabase
      .from("competitors")
      .update({ last_checked_at: new Date().toISOString() })
      .eq("id", competitor.id)
      .eq("restaurant_id", restaurantId);
    return {
      competitorId: competitor.id,
      ok: false,
      fetchStatus: "error",
      errorMessage: "URL manquante — impossible de vérifier.",
      isInitialSnapshot: false,
      changesCreated: 0,
      changesSkipped: 0,
      contentHash: "",
    };
  }

  const previous = await getLatestSnapshot(supabase, competitor.id);
  const built = await buildCompetitorSnapshot({
    websiteUrl: competitor.url,
    pricingUrl: competitor.pricing_url,
  });

  const { error: snapError } = await supabase.from("competitor_snapshots").insert({
    restaurant_id: restaurantId,
    competitor_id: competitor.id,
    homepage_url: built.data.homepageUrl,
    pricing_url: built.data.pricingUrl,
    title: built.data.title,
    description: built.data.description,
    hero: built.data.hero,
    cta: built.data.cta,
    pricing_text: built.data.pricingText,
    plans: built.data.plans,
    content_hash: built.contentHash,
    source_urls: built.sourceUrls,
    fetch_status: built.fetchStatus,
    error_message: built.errorMessage,
  });

  if (snapError) {
    console.error("[competitor-watch] snapshot", snapError.message);
  }

  const isInitial = !previous;
  const detected = diffCompetitorSnapshots(previous?.data ?? null, built.data, {
    fetchStatus: built.fetchStatus,
    previousFetchStatus: previous?.fetchStatus ?? null,
  });

  const persisted = isInitial
    ? { created: 0, skipped: 0, ids: [] as string[] }
    : await persistChanges(supabase, restaurantId, competitor.id, competitor.name, detected);

  const pricingSummary =
    built.data.plans.length > 0
      ? built.data.plans.map((p) => `${p.name}: ${p.price}`).join(" · ").slice(0, 500)
      : competitor.pricing;

  await supabase
    .from("competitors")
    .update({
      last_checked_at: new Date().toISOString(),
      pricing_url: competitor.pricing_url || built.data.pricingUrl || null,
      positioning: built.data.hero?.slice(0, 500) || competitor.positioning,
      pricing: pricingSummary,
      status: built.fetchStatus === "ok" ? "watching" : "check_failed",
    })
    .eq("id", competitor.id)
    .eq("restaurant_id", restaurantId);

  return {
    competitorId: competitor.id,
    ok: built.fetchStatus === "ok",
    fetchStatus: built.fetchStatus,
    errorMessage: built.errorMessage,
    isInitialSnapshot: isInitial,
    changesCreated: persisted.created,
    changesSkipped: persisted.skipped,
    contentHash: built.contentHash,
  };
}

/** Batch cron : isole les erreurs par concurrent. */
export async function runCompetitorWatchBatch(
  supabase: SupabaseClient,
  opts?: { limit?: number },
): Promise<{ processed: number; changesCreated: number; errors: number }> {
  const limit = opts?.limit ?? 40;
  const { data: rows, error } = await supabase
    .from("competitors")
    .select("id, restaurant_id, name, url, pricing_url, positioning, pricing, notes, active, status, last_checked_at")
    .eq("active", true)
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .limit(limit);

  if (error) {
    console.error("[competitor-watch] batch select", error.message);
    return { processed: 0, changesCreated: 0, errors: 1 };
  }

  let processed = 0;
  let changesCreated = 0;
  let errors = 0;

  for (const row of rows ?? []) {
    try {
      const result = await checkCompetitor(supabase, String(row.restaurant_id), {
        id: String(row.id),
        name: String(row.name),
        url: row.url ?? null,
        pricing_url: row.pricing_url ?? null,
        positioning: row.positioning ?? null,
        pricing: row.pricing ?? null,
        notes: row.notes ?? null,
        active: row.active !== false,
        status: String(row.status ?? "watching"),
        last_checked_at: row.last_checked_at ?? null,
      });
      processed += 1;
      changesCreated += result.changesCreated;
      if (!result.ok && result.fetchStatus === "error" && !result.errorMessage?.includes("URL")) {
        errors += 1;
      }
    } catch (err) {
      errors += 1;
      console.error("[competitor-watch] competitor failed", row.id, err);
    }
  }

  return { processed, changesCreated, errors };
}
