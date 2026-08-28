import type { AgentToolExecutionContext, AgentToolResult } from "@/src/lib/sharpz/agent-tools/types";
import type { ScheduleFollowupInput } from "@/src/lib/sharpz/agent-tools/schemas";

export async function handleScheduleFollowup(
  ctx: AgentToolExecutionContext,
  input: ScheduleFollowupInput,
): Promise<AgentToolResult> {
  const { supabase, restaurant } = ctx.session;

  let prospectQuery = supabase
    .from("prospects")
    .select("id, company, name, status, next_follow_up_at")
    .eq("restaurant_id", restaurant.id);

  if (input.prospectId) {
    prospectQuery = prospectQuery.eq("id", input.prospectId);
  } else if (input.company) {
    prospectQuery = prospectQuery.ilike("company", input.company.trim());
  }

  const { data: matches, error } = await prospectQuery.limit(5);
  if (error) {
    return { tool: "schedule_followup", status: "error", error: error.message };
  }

  if (!matches?.length) {
    return {
      tool: "schedule_followup",
      status: "error",
      error: "Prospect introuvable dans votre CRM. Précisez le nom ou ajoutez-le d'abord dans Prospects.",
    };
  }

  if (matches.length > 1 && !input.prospectId) {
    return {
      tool: "schedule_followup",
      status: "error",
      error: `Plusieurs prospects correspondent à « ${input.company} ». Précisez prospectId (${matches.map((m) => m.company).join(", ")}).`,
    };
  }

  const prospect = matches[0];
  const days = input.daysFromNow ?? 7;
  const nextFollowUpAt = new Date();
  nextFollowUpAt.setDate(nextFollowUpAt.getDate() + days);

  return {
    tool: "schedule_followup",
    status: "confirmation_required",
    message: `Relance proposée dans ${days} jours — validation requise.`,
    proposedFollowUp: {
      prospectId: String(prospect.id),
      company: String(prospect.company),
      name: (prospect.name as string | null) ?? null,
      daysFromNow: days,
      nextFollowUpAt: nextFollowUpAt.toISOString(),
      note: input.note?.trim(),
    },
  };
}
