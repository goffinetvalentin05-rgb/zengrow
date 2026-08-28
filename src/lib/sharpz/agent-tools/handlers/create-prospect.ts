import type { AgentToolExecutionContext, AgentToolResult } from "@/src/lib/sharpz/agent-tools/types";
import type { CreateProspectInput } from "@/src/lib/sharpz/agent-tools/schemas";

export async function handleCreateProspect(
  ctx: AgentToolExecutionContext,
  input: CreateProspectInput,
): Promise<AgentToolResult> {
  const company = input.company.trim();
  const duplicate = ctx.sharpzContext.prospects.some(
    (item) => item.company?.trim().toLowerCase() === company.toLowerCase(),
  );

  if (duplicate) {
    return {
      tool: "create_prospect",
      status: "error",
      error: `« ${company} » existe déjà dans votre CRM.`,
    };
  }

  return {
    tool: "create_prospect",
    status: "confirmation_required",
    message: "Prospect proposé — validation utilisateur requise avant ajout au CRM.",
    proposedProspect: {
      company,
      name: input.name?.trim() ?? null,
      url: input.url ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      contact: input.contact?.trim() ?? null,
      whyFit: input.whyFit?.trim() ?? null,
      notes: input.notes?.trim() ?? null,
    },
  };
}
