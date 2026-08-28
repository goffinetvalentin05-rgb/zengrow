import type { AgentToolExecutionContext, AgentToolResult } from "@/src/lib/sharpz/agent-tools/types";
import type { CreateActionInput } from "@/src/lib/sharpz/agent-tools/schemas";
import {
  clampConfidence,
  clampEffort,
  clampImpact,
  computeSharpzScore,
} from "@/src/lib/sharpz/scoring";
import type { ActionCategory } from "@/src/lib/sharpz/types";

const ACTION_CATEGORIES = new Set<ActionCategory>([
  "acquisition",
  "conversion",
  "landing",
  "pricing",
  "content",
  "seo",
  "retention",
  "market",
  "prospection",
  "monetisation",
  "positioning",
]);

function normalizeCategory(value: string): ActionCategory {
  return ACTION_CATEGORIES.has(value as ActionCategory) ? (value as ActionCategory) : "acquisition";
}

export async function handleCreateAction(
  ctx: AgentToolExecutionContext,
  input: CreateActionInput,
): Promise<AgentToolResult> {
  const title = input.title.trim();
  const existingTitles = new Set(
    [
      ...ctx.sharpzContext.openActions.map((item) => item.title),
      ...ctx.sharpzContext.actions.filter((item) => item.status === "todo").map((item) => item.title),
    ].map((t) => t.trim().toLowerCase()),
  );

  if (existingTitles.has(title.toLowerCase())) {
    return {
      tool: "create_action",
      status: "error",
      error: "Une action similaire existe déjà dans votre plan.",
    };
  }

  const impact = clampImpact(input.impact ?? 7);
  const effort = clampEffort(input.effort ?? 5);
  const confidence = clampConfidence(input.confidence ?? 70);

  return {
    tool: "create_action",
    status: "confirmation_required",
    message: "Action proposée — validation utilisateur requise avant persistance.",
    proposedAction: {
      title,
      category: normalizeCategory(input.category ?? "acquisition"),
      impact,
      effort,
      confidence,
      score: computeSharpzScore(impact, effort, confidence),
      why: input.why?.trim() || "",
      howTo: input.howTo?.trim(),
      objectiveKey: input.objectiveKey ?? ctx.sharpzContext.primaryObjective?.key ?? null,
    },
  };
}
