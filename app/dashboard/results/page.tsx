import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { ProgressView } from "@/src/components/sharpz/progress/progress-view";
import { getActions, getExperiments, getIntegrations, hasConnectedIntegration } from "@/src/lib/sharpz/queries";

export default async function ResultsPage() {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();
  const [actions, experiments, integrations] = await Promise.all([
    getActions(supabase, restaurant.id),
    getExperiments(supabase, restaurant.id),
    getIntegrations(supabase, restaurant.id),
  ]);
  return (
    <ProgressView
      actions={actions}
      experiments={experiments}
      hasConnectedData={hasConnectedIntegration(integrations)}
    />
  );
}
