import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { generateWithTools } from "@/src/lib/ai/openai";
import { executeAgentTool, toolResultForModel } from "@/src/lib/sharpz/agent-tools/execute";
import { getAvailableTools, getToolByName } from "@/src/lib/sharpz/agent-tools/registry";
import type {
  AgentOrchestratorResult,
  AgentSession,
  AgentToolName,
  AgentToolResult,
  ProposedActionPayload,
  ProposedCompetitorPayload,
  ProposedExperimentPayload,
  ProposedFollowUpPayload,
  ProposedProspectPayload,
  SharpzAgentContext,
} from "@/src/lib/sharpz/agent-tools/types";

const MAX_TOOL_ROUNDS = 3;

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

function buildSystemPrompt(context: SharpzAgentContext): string {
  const available = getAvailableTools(context).map((t) => t.name);
  return `Tu es Orion, l'agent Sharpz — Growth OS pour fondateurs SaaS.

Tu disposes d'outils Sharpz côté serveur. Utilise-les quand l'intention utilisateur le nécessite — ne simule jamais leur exécution en texte.

Outils disponibles : ${available.join(", ") || "aucun"}.

Règles absolues :
- N'invente aucune métrique, entreprise, email, téléphone, MRR, trafic ou concurrent.
- MRR / revenue : uniquement si capabilities.revenueData = true et chiffres présents dans le contexte — sinon dis que Stripe n'est pas connecté.
- Trafic / visiteurs : uniquement via analyze_traffic — jamais de chiffres inventés.
- Changements concurrents : uniquement via analyze_competitor_changes ou competitor_changes en base — jamais inventés. Si aucun concurrent / aucun change, dis-le clairement.
- search_prospects / search_competitors : uniquement via l'outil — jamais de liste inventée. Si not_configured, explique clairement.
- create_action, schedule_followup, create_experiment, create_prospect, create_competitor : proposent une validation utilisateur — ne prétends pas avoir persisté.
- Ne copie jamais automatiquement le pricing d'un concurrent : recommande une action seulement si pertinent vs objectifs.
- schedule_followup : si le prospect cible est ambigu (« le », « ce prospect », plusieurs homonymes), demande lequel — ne choisis jamais au hasard.
- analyze_traffic : si missing_integration, dis-le clairement et guide l'installation.
- Ne duplique pas une action déjà ouverte (openActions).
- Les objectifs utilisateur (primaryObjective) doivent influencer tes priorités.
- experiments dans le contexte : si l'utilisateur demande si un test a marché, base-toi uniquement sur status/result/conclusion/before/after — ne réinvente pas.
- Ne repropose pas une idée déjà testée avec conclusion négative ou neutre sans le mentionner.
- growthNotifications : signaux Growth réels non inventés. Si l'utilisateur demande ce qui mérite son attention, priorise les non lus selon objectif, urgence (severity) et impact.
- Réponds en français, concis, orienté exécution.

Après exécution d'un outil, explique le résultat et propose la prochaine étape concrète.`;
}

function buildContextUserMessage(context: SharpzAgentContext, conversation: ConversationMessage[]): string {
  return JSON.stringify({
    context,
    conversation: conversation.slice(-8),
  });
}

function mergeToolResults(
  accumulator: {
    prospects: AgentOrchestratorResult["prospects"];
    competitors: AgentOrchestratorResult["competitors"];
    proposedActions: ProposedActionPayload[];
    proposedFollowUps: ProposedFollowUpPayload[];
    proposedExperiments: ProposedExperimentPayload[];
    proposedProspects: ProposedProspectPayload[];
    proposedCompetitors: ProposedCompetitorPayload[];
    toolsCalled: AgentToolName[];
    searchError?: AgentOrchestratorResult["searchError"];
    capability?: string;
  },
  result: AgentToolResult,
) {
  accumulator.toolsCalled.push(result.tool);

  if (result.prospects?.length) {
    accumulator.prospects.push(...result.prospects);
  }
  if (result.competitors?.length) {
    accumulator.competitors.push(...result.competitors);
  }
  if (result.proposedAction) accumulator.proposedActions.push(result.proposedAction);
  if (result.proposedFollowUp) accumulator.proposedFollowUps.push(result.proposedFollowUp);
  if (result.proposedExperiment) accumulator.proposedExperiments.push(result.proposedExperiment);
  if (result.proposedProspect) accumulator.proposedProspects.push(result.proposedProspect);
  if (result.proposedCompetitor) accumulator.proposedCompetitors.push(result.proposedCompetitor);

  if (result.tool === "search_prospects") {
    if (result.status === "not_configured") accumulator.capability = "prospect_search_not_connected";
    if (result.status === "error" && result.error) {
      accumulator.searchError = { message: result.error, retryable: result.retryable ?? false };
      accumulator.capability = "prospect_search_error";
    }
    if (result.status === "ok") accumulator.capability = "prospect_search";
  }
  if (result.tool === "search_competitors") {
    if (result.status === "not_configured") accumulator.capability = "competitor_search_not_connected";
    if (result.status === "error" && result.error) {
      accumulator.searchError = { message: result.error, retryable: result.retryable ?? false };
      accumulator.capability = "competitor_search_error";
    }
    if (result.status === "ok") accumulator.capability = "competitor_search";
  }
  if (result.tool === "analyze_traffic" && result.status === "missing_integration") {
    accumulator.capability = "traffic_not_connected";
  }
}

export async function runAgentOrchestrator(input: {
  session: AgentSession;
  sharpzContext: SharpzAgentContext;
  messages: ConversationMessage[];
}): Promise<AgentOrchestratorResult> {
  const { session, sharpzContext, messages } = input;
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const tools = getAvailableTools(sharpzContext);
  const openaiTools = tools.map((t) => t.openaiTool);

  const accumulator = {
    prospects: [] as AgentOrchestratorResult["prospects"],
    competitors: [] as AgentOrchestratorResult["competitors"],
    proposedActions: [] as ProposedActionPayload[],
    proposedFollowUps: [] as ProposedFollowUpPayload[],
    proposedExperiments: [] as ProposedExperimentPayload[],
    proposedProspects: [] as ProposedProspectPayload[],
    proposedCompetitors: [] as ProposedCompetitorPayload[],
    toolsCalled: [] as AgentToolName[],
    searchError: undefined as AgentOrchestratorResult["searchError"],
    capability: undefined as string | undefined,
  };

  const llmMessages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: buildContextUserMessage(sharpzContext, messages),
    },
  ];

  let model = "";
  let finalReply = "";
  let round = 0;

  while (round < MAX_TOOL_ROUNDS) {
    round += 1;
    const generation = await generateWithTools({
      system: buildSystemPrompt(sharpzContext),
      messages: llmMessages,
      tools: openaiTools,
      maxTokens: 1800,
      timeoutMs: 45000,
    });
    model = generation.model;

    if (generation.toolCalls.length === 0) {
      finalReply = generation.message.content?.trim() || "Je n'ai pas pu formuler de réponse.";
      break;
    }

    llmMessages.push({
      role: "assistant",
      content: generation.message.content ?? "",
      tool_calls: generation.message.tool_calls,
    });

    for (const call of generation.toolCalls) {
      const toolDef = getToolByName(call.name);
      let parsedArgs: unknown = {};
      try {
        parsedArgs = call.arguments ? JSON.parse(call.arguments) : {};
      } catch {
        parsedArgs = {};
      }

      let toolResult: AgentToolResult;
      if (!toolDef || !toolDef.isAvailable(sharpzContext)) {
        toolResult = {
          tool: (call.name as AgentToolName) ?? "search_prospects",
          status: "not_configured",
          error: `Outil « ${call.name} » non disponible.`,
        };
      } else {
        toolResult = await executeAgentTool(
          toolDef.name,
          { session, sharpzContext, userMessage: lastUser },
          parsedArgs,
        );
      }

      mergeToolResults(accumulator, toolResult);

      llmMessages.push({
        role: "tool",
        tool_call_id: call.id,
        content: toolResultForModel(toolResult),
      });
    }
  }

  if (!finalReply) {
    const followUp = await generateWithTools({
      system: buildSystemPrompt(sharpzContext),
      messages: llmMessages,
      tools: [],
      maxTokens: 1200,
      timeoutMs: 25000,
    });
    model = followUp.model;
    finalReply = followUp.message.content?.trim() || finalReply;
  }

  return {
    reply: finalReply,
    prospects: accumulator.prospects,
    competitors: accumulator.competitors,
    proposedActions: accumulator.proposedActions,
    proposedFollowUps: accumulator.proposedFollowUps,
    proposedExperiments: accumulator.proposedExperiments,
    proposedProspects: accumulator.proposedProspects,
    proposedCompetitors: accumulator.proposedCompetitors,
    meta: {
      model,
      toolsCalled: accumulator.toolsCalled,
      capability: accumulator.capability,
    },
    searchError: accumulator.searchError,
  };
}

export type { AgentSession };
