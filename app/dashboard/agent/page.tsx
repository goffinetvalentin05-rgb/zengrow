import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { AgentView } from "@/src/components/sharpz/agent/agent-view";
import {
  getActions,
  getCompetitors,
  getLatestAudit,
  getObjectives,
  getProspects,
  getUserSaas,
} from "@/src/lib/sharpz/queries";

function firstNameFromUser(meta: Record<string, unknown> | undefined, email: string | undefined) {
  const name = typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  if (name) return name.split(/\s+/)[0] ?? name;
  const local = email?.split("@")[0]?.trim();
  return local || null;
}

export default async function AgentPage() {
  const { restaurant, user } = await requireRestaurantSession();
  const supabase = await createClient();

  const [saas, lastAudit, prospects, competitors, objectives, actions] = await Promise.all([
    getUserSaas(supabase, restaurant.id),
    getLatestAudit(supabase, restaurant.id),
    getProspects(supabase, restaurant.id),
    getCompetitors(supabase, restaurant.id),
    getObjectives(supabase, restaurant.id),
    getActions(supabase, restaurant.id),
  ]);
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const primaryObjective = objectives.find((item) => item.isPrimary);
  const openActionCount = actions.filter(
    (item) => item.status === "todo" || item.status === "in_progress",
  ).length;

  return (
    <AgentView
      firstName={firstNameFromUser(meta, user.email ?? undefined)}
      hasSaasProfile={Boolean(saas)}
      hasVerifiedAudit={Boolean(lastAudit)}
      prospectCount={prospects.length}
      competitorCount={competitors.length}
      openActionCount={openActionCount}
      primaryObjectiveKey={primaryObjective?.key ?? null}
      primaryObjectiveCustomLabel={primaryObjective?.customLabel ?? null}
    />
  );
}
