import { redirect } from "next/navigation";
import { OnboardingClient } from "@/components/fitme-app/OnboardingClient";
import { ensureProfile, requireFitmeUser } from "@/src/lib/fitme/auth";
import { getLatestAnalysis, resolveFitmePath } from "@/src/lib/fitme/routing";

export default async function OnboardingPage() {
  const user = await requireFitmeUser();
  const profile = await ensureProfile(user.id, user.email);
  const analysis = await getLatestAnalysis(user.id);
  const destination = resolveFitmePath(analysis);
  if (destination !== "/onboarding") redirect(destination);

  return <OnboardingClient firstName={profile.first_name} />;
}
