import { DiscoveryShell } from "@/src/components/discovery/app-shell";
import { OnboardingFlow } from "@/src/components/discovery/onboarding-flow";
import { requireDiscoverySession } from "@/src/lib/discovery/auth";
import { getCategories, getOwnedRelations } from "@/src/lib/discovery/queries";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Set up Sharpz",
};

export default async function OnboardingPage() {
  const session = await requireDiscoverySession();
  if (session.profile.onboardingCompleted) redirect(DISCOVERY_ROUTES.explore);
  const supabase = await createClient();
  const [categories, relations] = await Promise.all([
    getCategories(supabase),
    getOwnedRelations(supabase, session.profile.id),
  ]);
  const featured =
    relations.projects.find((project) => project.featuredProject) ?? relations.projects[0] ?? null;

  return (
    <DiscoveryShell
      displayName={session.profile.displayName}
      avatarUrl={session.profile.avatarUrl}
      completeness={session.profile.completeness}
      username={session.profile.username}
      hideChrome
    >
      <OnboardingFlow
        userId={session.user.id}
        profile={session.profile}
        categories={categories}
        initialNicheIds={relations.categoryLinks.map((item) => item.category_id)}
        initialProject={featured}
        initialSocials={relations.socialLinks}
      />
    </DiscoveryShell>
  );
}
