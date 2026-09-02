import { SavedView } from "@/src/components/discovery/saved-view";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getSavedProfiles } from "@/src/lib/discovery/queries";
import { createClient } from "@/src/lib/supabase/server";

export default async function SavedPage() {
  const session = await requireOnboardedSession();
  const supabase = await createClient();
  const profiles = await getSavedProfiles(supabase, session.profile.id);

  return <SavedView profiles={profiles} />;
}
