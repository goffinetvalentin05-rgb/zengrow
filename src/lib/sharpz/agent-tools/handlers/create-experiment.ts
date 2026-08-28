import type { AgentToolExecutionContext, AgentToolResult } from "@/src/lib/sharpz/agent-tools/types";
import type { CreateExperimentInput } from "@/src/lib/sharpz/agent-tools/schemas";

export async function handleCreateExperiment(
  ctx: AgentToolExecutionContext,
  input: CreateExperimentInput,
): Promise<AgentToolResult> {
  const hypothesis = input.hypothesis.trim();

  if (input.actionId) {
    const exists = ctx.sharpzContext.actions.some((item) => item.id === input.actionId);
    if (!exists) {
      return {
        tool: "create_experiment",
        status: "error",
        error: "Action liée introuvable dans votre espace.",
      };
    }
  }

  return {
    tool: "create_experiment",
    status: "confirmation_required",
    message: "Expérimentation proposée — validation utilisateur requise.",
    proposedExperiment: {
      hypothesis,
      title: input.title?.trim() || null,
      actionId: input.actionId ?? null,
      actionDescription: input.actionDescription?.trim() ?? null,
      metric: input.metric ?? "visitors_7d",
      plannedDays: input.plannedDays ?? 14,
    },
  };
}
