import type { AgentToolExecutionContext, AgentToolResult } from "@/src/lib/sharpz/agent-tools/types";
import type { SearchCompetitorsInput } from "@/src/lib/sharpz/agent-tools/schemas";
import { isProspectSearchConfigured } from "@/src/lib/sharpz/prospect-search/providers";
import {
  ProspectSearchError,
  searchCompetitorsWeb,
} from "@/src/lib/sharpz/competitor-watch/search";

export async function handleSearchCompetitors(
  ctx: AgentToolExecutionContext,
  input: SearchCompetitorsInput,
): Promise<AgentToolResult> {
  if (!isProspectSearchConfigured()) {
    return {
      tool: "search_competitors",
      status: "not_configured",
      message:
        "La recherche web de concurrents n’est pas configurée (Tavily / Serper / Brave). Ajoutez des concurrents manuellement dans Analytics > Market — aucun nom inventé.",
    };
  }

  try {
    const result = await searchCompetitorsWeb({
      context: ctx.sharpzContext,
      query: input.query,
      count: input.count,
    });

    if (result.competitors.length === 0) {
      return {
        tool: "search_competitors",
        status: "ok",
        message:
          "Aucun concurrent vérifiable trouvé pour cette requête. Affinez les mots-clés ou ajoutez une URL manuellement.",
        competitors: [],
        meta: { queries: result.queries, provider: result.provider },
      };
    }

    return {
      tool: "search_competitors",
      status: "ok",
      message: `${result.competitors.length} concurrent(s) proposés depuis le web — validation utilisateur requise avant ajout.`,
      competitors: result.competitors.map((c) => ({
        companyName: c.companyName,
        website: c.website,
        whyCompetitor: c.whyCompetitor,
        sourceUrl: c.sourceUrl,
        confidence: c.confidence,
      })),
      meta: { queries: result.queries, provider: result.provider },
    };
  } catch (error) {
    if (error instanceof ProspectSearchError) {
      return {
        tool: "search_competitors",
        status: "error",
        error: error.message,
        retryable: error.retryable,
      };
    }
    throw error;
  }
}
