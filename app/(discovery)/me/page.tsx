import { PublicProfileView } from "@/src/components/discovery/public-profile";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getPublicProfileById } from "@/src/lib/discovery/queries";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { createClient } from "@/src/lib/supabase/server";

export default async function MePage() {
  const session = await requireOnboardedSession();
  const supabase = await createClient();
  const profile = await getPublicProfileById(supabase, session.profile.id, session.profile.id);
  if (!profile) return null;

  return (
    <PublicProfileView
      profile={profile}
      isOwner
      isLoggedIn
      source="direct"
      editHref={DISCOVERY_ROUTES.meEdit}
      showOwnerBar
    />
  );
}
