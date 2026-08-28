import type { AgentToolExecutionContext, AgentToolResult } from "@/src/lib/sharpz/agent-tools/types";
import type { SearchProspectsInput } from "@/src/lib/sharpz/agent-tools/schemas";
import { isProspectSearchConfigured } from "@/src/lib/sharpz/prospect-search/providers";
import { searchProspects } from "@/src/lib/sharpz/prospect-search/search-prospects";
import { ProspectSearchError } from "@/src/lib/sharpz/prospect-search/types";

export async function handleSearchProspects(
  ctx: AgentToolExecutionContext,
  input: SearchProspectsInput,
): Promise<AgentToolResult> {
  if (!isProspectSearchConfigured()) {
    return {
      tool: "search_prospects",
      status: "not_configured",
      message:
        "Recherche web non configurée (clé API manquante). Aucun prospect inventé — ajoutez manuellement dans Prospects.",
    };
  }

  try {
    const result = await searchProspects({
      supabase: ctx.session.supabase,
      user: ctx.session.user,
      restaurant: ctx.session.restaurant,
      userMessage: `Trouve ${input.count} prospects : ${input.query}`,
      context: ctx.sharpzContext,
    });

    return {
      tool: "search_prospects",
      status: "ok",
      message: result.reply,
      prospects: result.prospects,
      meta: {
        requested: result.requested,
        found: result.found,
        duplicatesRemoved: result.duplicatesRemoved,
        provider: result.provider,
      },
    };
  } catch (error) {
    if (error instanceof ProspectSearchError) {
      return {
        tool: "search_prospects",
        status: "error",
        error: error.message,
        retryable: error.retryable,
        prospects: [],
      };
    }
    throw error;
  }
}
