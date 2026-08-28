import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { AnalyseView } from "@/src/components/sharpz/analyse/analyse-view";
import { getActions, getAuditFindings, getLatestAudit } from "@/src/lib/sharpz/queries";

export default async function AnalysePage() {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();
  const lastAudit = await getLatestAudit(supabase, restaurant.id);
  const [findings, actions] = await Promise.all([
    getAuditFindings(supabase, restaurant.id, lastAudit?.id),
    getActions(supabase, restaurant.id),
  ]);
  const recommended = actions.filter((item) => item.sourceType === "audit" && item.status === "todo").slice(0, 6);
  return <AnalyseView lastAudit={lastAudit} findings={findings} recommendedActions={recommended} />;
}
