import { redirect } from "next/navigation";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { OnboardingFlow } from "@/src/components/sharpz/onboarding/onboarding-flow";
import { buildOnboardingInitialState } from "@/src/lib/sharpz/onboarding";
import { getChannels, getObjectives, getUserSaas } from "@/src/lib/sharpz/queries";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";

export default async function OnboardingPage() {
  const restaurant = await requireRestaurant();
  const supabase = await createClient();

  const [saas, objectives, channels] = await Promise.all([
    getUserSaas(supabase, restaurant.id),
    getObjectives(supabase, restaurant.id),
    getChannels(supabase, restaurant.id),
  ]);

  if (saas?.onboardingCompleted) {
    redirect(SHARPZ_ROUTES.agent);
  }

  const initial = buildOnboardingInitialState(saas, objectives, channels);

  return <OnboardingFlow initial={initial} />;
}
