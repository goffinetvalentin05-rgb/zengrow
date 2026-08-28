import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { HomeDashboard } from "@/src/components/sharpz/dashboard/home-dashboard";
import {
  getActions,
  getCompetitorChanges,
  getIntegrations,
  getLatestAudit,
  getOpportunities,
  hasConnectedIntegration,
} from "@/src/lib/sharpz/queries";

export default async function DashboardPage() {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();

  const [actions, opportunities, alerts, lastAudit, integrations] = await Promise.all([
    getActions(supabase, restaurant.id),
    getOpportunities(supabase, restaurant.id),
    getCompetitorChanges(supabase, restaurant.id),
    getLatestAudit(supabase, restaurant.id),
    getIntegrations(supabase, restaurant.id),
  ]);

  const openStatuses = new Set(["todo", "in_progress"]);
  const topActions = actions.filter((item) => openStatuses.has(item.status)).slice(0, 3);

  return (
    <HomeDashboard
      topActions={topActions}
      opportunities={opportunities.slice(0, 4)}
      alerts={alerts.filter((item) => item.importance === "high" || item.importance === "medium")}
      lastAudit={lastAudit}
      hasConnectedData={hasConnectedIntegration(integrations)}
      actionsDone={actions.filter((item) => item.status === "done").length}
      actionsOpen={actions.filter((item) => openStatuses.has(item.status)).length}
      opportunitiesCount={opportunities.length}
    />
  );
}
