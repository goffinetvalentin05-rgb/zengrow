import { DiscoveryShell } from "@/src/components/discovery/app-shell";
import { OnboardingFlow } from "@/src/components/discovery/onboarding-flow";
import { requireDiscoverySession } from "@/src/lib/discovery/auth";
import { getCategories } from "@/src/lib/discovery/queries";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { slugifyUsername } from "@/src/lib/discovery/slug";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await requireDiscoverySession();
  if (session.profile.onboardingCompleted) redirect(DISCOVERY_ROUTES.explore);
  const supabase = await createClient();
  const categories = await getCategories(supabase);
  const suggested = slugifyUsername(session.profile.username || session.profile.displayName || session.user.email || "member");

  return (
    <DiscoveryShell
      displayName={session.profile.displayName}
      avatarUrl={session.profile.avatarUrl}
      completeness={session.profile.completeness}
      username={session.profile.username}
      hideChrome
    >
      <OnboardingFlow
        categories={categories}
        initialName={session.profile.displayName}
        initialUsername={suggested}
      />
    </DiscoveryShell>
  );
}
