import type { AgentToolExecutionContext, AgentToolResult } from "@/src/lib/sharpz/agent-tools/types";
import type { AnalyzeCompetitorChangesInput } from "@/src/lib/sharpz/agent-tools/schemas";

export async function handleAnalyzeCompetitorChanges(
  ctx: AgentToolExecutionContext,
  input: AnalyzeCompetitorChangesInput,
): Promise<AgentToolResult> {
  const days = input.days ?? 14;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const nameById = new Map(ctx.sharpzContext.competitors.map((c) => [c.id, c.name]));

  if (ctx.sharpzContext.competitors.length === 0) {
    return {
      tool: "analyze_competitor_changes",
      status: "ok",
      message:
        "Aucun concurrent configuré. Ajoutez-en dans Analytics > Market (URL publique) — je ne peux pas inventer de veille.",
      competitorChanges: [],
    };
  }

  const { data } = await ctx.session.supabase
    .from("competitor_changes")
    .select("*, competitors(name)")
    .eq("restaurant_id", ctx.session.restaurant.id)
    .order("created_at", { ascending: false })
    .limit(40);

  let changes = (data ?? [])
    .map((row) => {
      const joined = row.competitors as { name?: string } | null;
      return {
        id: String(row.id),
        competitorId: row.competitor_id ? String(row.competitor_id) : null,
        competitorName:
          joined?.name ??
          (row.competitor_id ? nameById.get(String(row.competitor_id)) : null) ??
          null,
        changeType: String(row.change_type ?? ""),
        whatChanged: String(row.what_changed ?? ""),
        importance: String(row.importance ?? "medium"),
        whyItMatters: row.why_it_matters ?? null,
        beforeValue: row.before_value ?? null,
        afterValue: row.after_value ?? null,
        sourceUrl: row.source_url ?? null,
        confidence: row.confidence ?? null,
        createdAt: String(row.created_at ?? ""),
      };
    })
    .filter((c) => new Date(c.createdAt).getTime() >= cutoff);

  if (input.competitorName?.trim()) {
    const needle = input.competitorName.trim().toLowerCase();
    changes = changes.filter((c) => (c.competitorName ?? "").toLowerCase().includes(needle));
  }

  if (changes.length === 0) {
    return {
      tool: "analyze_competitor_changes",
      status: "ok",
      message: `Aucun changement concurrent persisté sur les ${days} derniers jours.`,
      competitorChanges: [],
    };
  }

  return {
    tool: "analyze_competitor_changes",
    status: "ok",
    message: `${changes.length} changement(s) réel(s) en base — réponses basées uniquement sur ces faits.`,
    competitorChanges: changes.slice(0, 20),
  };
}
