import type { AgentToolExecutionContext, AgentToolResult, AgentToolName } from "@/src/lib/sharpz/agent-tools/types";
import {
  analyzeCompetitorChangesInputSchema,
  analyzeTrafficInputSchema,
  createActionInputSchema,
  createCompetitorInputSchema,
  createExperimentInputSchema,
  createProspectInputSchema,
  parseToolInput,
  scheduleFollowupInputSchema,
  searchCompetitorsInputSchema,
  searchProspectsInputSchema,
  stripServerOnlyFields,
} from "@/src/lib/sharpz/agent-tools/schemas";
import { handleAnalyzeCompetitorChanges } from "@/src/lib/sharpz/agent-tools/handlers/analyze-competitor-changes";
import { handleAnalyzeTraffic } from "@/src/lib/sharpz/agent-tools/handlers/analyze-traffic";
import { handleCreateAction } from "@/src/lib/sharpz/agent-tools/handlers/create-action";
import { handleCreateCompetitor } from "@/src/lib/sharpz/agent-tools/handlers/create-competitor";
import { handleCreateExperiment } from "@/src/lib/sharpz/agent-tools/handlers/create-experiment";
import { handleCreateProspect } from "@/src/lib/sharpz/agent-tools/handlers/create-prospect";
import { handleScheduleFollowup } from "@/src/lib/sharpz/agent-tools/handlers/schedule-followup";
import { handleSearchCompetitors } from "@/src/lib/sharpz/agent-tools/handlers/search-competitors";
import { handleSearchProspects } from "@/src/lib/sharpz/agent-tools/handlers/search-prospects";

const HANDLERS: Record<
  AgentToolName,
  (ctx: AgentToolExecutionContext, input: unknown) => Promise<AgentToolResult>
> = {
  search_prospects: async (ctx, raw) => {
    const parsed = parseToolInput(searchProspectsInputSchema, stripServerOnlyFields(raw));
    if (!parsed.ok) return { tool: "search_prospects", status: "error", error: parsed.error };
    return handleSearchProspects(ctx, parsed.data);
  },
  create_action: async (ctx, raw) => {
    const parsed = parseToolInput(createActionInputSchema, stripServerOnlyFields(raw));
    if (!parsed.ok) return { tool: "create_action", status: "error", error: parsed.error };
    return handleCreateAction(ctx, parsed.data);
  },
  schedule_followup: async (ctx, raw) => {
    const parsed = parseToolInput(scheduleFollowupInputSchema, stripServerOnlyFields(raw));
    if (!parsed.ok) return { tool: "schedule_followup", status: "error", error: parsed.error };
    return handleScheduleFollowup(ctx, parsed.data);
  },
  analyze_traffic: async (ctx, raw) => {
    const parsed = parseToolInput(analyzeTrafficInputSchema, stripServerOnlyFields(raw));
    if (!parsed.ok) return { tool: "analyze_traffic", status: "error", error: parsed.error };
    return handleAnalyzeTraffic(ctx, parsed.data);
  },
  create_experiment: async (ctx, raw) => {
    const parsed = parseToolInput(createExperimentInputSchema, stripServerOnlyFields(raw));
    if (!parsed.ok) return { tool: "create_experiment", status: "error", error: parsed.error };
    return handleCreateExperiment(ctx, parsed.data);
  },
  search_competitors: async (ctx, raw) => {
    const parsed = parseToolInput(searchCompetitorsInputSchema, stripServerOnlyFields(raw));
    if (!parsed.ok) return { tool: "search_competitors", status: "error", error: parsed.error };
    return handleSearchCompetitors(ctx, parsed.data);
  },
  analyze_competitor_changes: async (ctx, raw) => {
    const parsed = parseToolInput(analyzeCompetitorChangesInputSchema, stripServerOnlyFields(raw));
    if (!parsed.ok) return { tool: "analyze_competitor_changes", status: "error", error: parsed.error };
    return handleAnalyzeCompetitorChanges(ctx, parsed.data);
  },
  create_competitor: async (ctx, raw) => {
    const parsed = parseToolInput(createCompetitorInputSchema, stripServerOnlyFields(raw));
    if (!parsed.ok) return { tool: "create_competitor", status: "error", error: parsed.error };
    return handleCreateCompetitor(ctx, parsed.data);
  },
  create_prospect: async (ctx, raw) => {
    const parsed = parseToolInput(createProspectInputSchema, stripServerOnlyFields(raw));
    if (!parsed.ok) return { tool: "create_prospect", status: "error", error: parsed.error };
    return handleCreateProspect(ctx, parsed.data);
  },
};

export async function executeAgentTool(
  toolName: AgentToolName,
  ctx: AgentToolExecutionContext,
  rawInput: unknown,
): Promise<AgentToolResult> {
  const handler = HANDLERS[toolName];
  if (!handler) {
    return { tool: toolName, status: "error", error: `Tool inconnu: ${toolName}` };
  }

  const started = Date.now();
  try {
    const result = await handler(ctx, rawInput);
    console.info("[sharpz-agent-tool]", {
      tool: toolName,
      status: result.status,
      ms: Date.now() - started,
      restaurantId: ctx.session.restaurant.id,
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur tool inattendue.";
    console.error("[sharpz-agent-tool]", {
      tool: toolName,
      error: message,
      ms: Date.now() - started,
      restaurantId: ctx.session.restaurant.id,
    });
    return { tool: toolName, status: "error", error: message, retryable: false };
  }
}

export function toolResultForModel(result: AgentToolResult): string {
  return JSON.stringify({
    tool: result.tool,
    status: result.status,
    message: result.message,
    error: result.error,
    retryable: result.retryable,
    meta: result.meta,
    prospectsCount: result.prospects?.length ?? 0,
    competitorsCount: result.competitors?.length ?? 0,
    competitorChangesCount: result.competitorChanges?.length ?? 0,
    hasProposedAction: Boolean(result.proposedAction),
    hasProposedFollowUp: Boolean(result.proposedFollowUp),
    hasProposedExperiment: Boolean(result.proposedExperiment),
    hasProposedProspect: Boolean(result.proposedProspect),
    hasProposedCompetitor: Boolean(result.proposedCompetitor),
    traffic: result.traffic,
    competitorChanges: result.competitorChanges?.slice(0, 8),
  });
}
