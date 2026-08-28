import { Suspense } from "react";
import { headers } from "next/headers";
import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { SettingsView } from "@/src/components/sharpz/settings/settings-view";
import { getTrafficSummary, sharpzAnalyticsSnippet } from "@/src/lib/sharpz/analytics";
import { getChannels, getIntegrations, getObjectives, getUserSaas } from "@/src/lib/sharpz/queries";

function resolveAppOrigin(host: string | null) {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  if (host) return `https://${host}`;
  return "http://localhost:3000";
}

export default async function DashboardSettingsPage() {
  const { restaurant, access, user } = await requireRestaurantSession();
  const supabase = await createClient();
  const host = (await headers()).get("host");
  const origin = resolveAppOrigin(host);

  const [saas, objectives, channels, integrations, traffic] = await Promise.all([
    getUserSaas(supabase, restaurant.id),
    getObjectives(supabase, restaurant.id),
    getChannels(supabase, restaurant.id),
    getIntegrations(supabase, restaurant.id),
    getTrafficSummary(supabase, restaurant.id),
  ]);

  const analyticsSnippet = traffic.siteKey ? sharpzAnalyticsSnippet(origin, traffic.siteKey) : "";

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
        analyticsSnippet={analyticsSnippet}
        analyticsHasData={traffic.hasData}
        analyticsLastEventAt={traffic.lastEventAt}
      />
    </Suspense>
  );
}
