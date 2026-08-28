import type { AgentToolExecutionContext, AgentToolResult } from "@/src/lib/sharpz/agent-tools/types";
import type { CreateCompetitorInput } from "@/src/lib/sharpz/agent-tools/schemas";

export async function handleCreateCompetitor(
  ctx: AgentToolExecutionContext,
  input: CreateCompetitorInput,
): Promise<AgentToolResult> {
  const name = input.name.trim();
  const url = input.url?.trim() || null;

  const duplicate = ctx.sharpzContext.competitors.some((item) => {
    const sameName = item.name.trim().toLowerCase() === name.toLowerCase();
    const sameUrl =
      url && item.url
        ? item.url.replace(/\/$/, "").toLowerCase() === url.replace(/\/$/, "").toLowerCase()
        : false;
    return sameName || sameUrl;
  });

  if (duplicate) {
    return {
      tool: "create_competitor",
      status: "error",
      error: `« ${name} » est déjà suivi.`,
    };
  }

  if (!url) {
    return {
      tool: "create_competitor",
      status: "error",
      error: "Une URL publique est requise pour démarrer la veille.",
    };
  }

  return {
    tool: "create_competitor",
    status: "confirmation_required",
    message: "Concurrent proposé — validation utilisateur requise avant ajout et snapshot.",
    proposedCompetitor: {
      name,
      url,
      whyCompetitor: input.whyCompetitor?.trim() ?? null,
      sourceUrl: input.sourceUrl?.trim() ?? null,
    },
  };
}
