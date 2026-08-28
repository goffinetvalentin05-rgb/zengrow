import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { getTrafficSummary } from "@/src/lib/sharpz/analytics";
import { loadResultsImpacts } from "@/src/lib/sharpz/results";
import { ResultsView } from "@/src/components/sharpz/results/results-view";
import {
  getActions,
  getExperiments,
  getIntegrations,
  getProspects,
  hasConnectedIntegration,
} from "@/src/lib/sharpz/queries";

export default async function ResultsPage() {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();

  const [actions, experiments, integrations, prospects, traffic] = await Promise.all([
    getActions(supabase, restaurant.id),
    getExperiments(supabase, restaurant.id),
    getIntegrations(supabase, restaurant.id),
    getProspects(supabase, restaurant.id),
    getTrafficSummary(supabase, restaurant.id),
  ]);

  const trafficHasData = traffic.hasData;
  const impacts = await loadResultsImpacts(supabase, restaurant.id, actions, trafficHasData);

  return (
    <ResultsView
      actions={actions}
      experiments={experiments}
      impacts={impacts}
      prospects={prospects}
      hasConnectedData={hasConnectedIntegration(integrations)}
      trafficHasData={trafficHasData}
    />
  );
}
