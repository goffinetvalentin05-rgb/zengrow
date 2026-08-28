import { Suspense } from "react";
import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { SettingsView } from "@/src/components/sharpz/settings/settings-view";
import { getChannels, getIntegrations, getObjectives, getUserSaas } from "@/src/lib/sharpz/queries";

export default async function DashboardSettingsPage() {
  const { restaurant, access, user } = await requireRestaurantSession();
  const supabase = await createClient();
  const [saas, objectives, channels, integrations] = await Promise.all([
    getUserSaas(supabase, restaurant.id),
    getObjectives(supabase, restaurant.id),
    getChannels(supabase, restaurant.id),
    getIntegrations(supabase, restaurant.id),
  ]);

  return (
    <Suspense>
      <SettingsView
        saas={saas}
        objectives={objectives}
        channels={channels}
        integrations={integrations}
        userEmail={user.email ?? ""}
        subscriptionStatus={access.effectiveStatus}
        subscriptionPlan={access.effectivePlan ?? "starter"}
        trialEndDate={restaurant.trial_end_date}
        isOwnerDev={access.isOwnerDev}
      />
    </Suspense>
  );
}
