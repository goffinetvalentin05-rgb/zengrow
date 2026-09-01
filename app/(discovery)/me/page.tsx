import Link from "next/link";
import { PublicProfileView } from "@/src/components/discovery/public-profile";
import { requireOnboardedSession } from "@/src/lib/discovery/auth";
import { getPublicProfileById } from "@/src/lib/discovery/queries";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { createClient } from "@/src/lib/supabase/server";
import Button from "@/src/components/ui/button";

export default async function MePage() {
  const session = await requireOnboardedSession();
  const supabase = await createClient();
  const profile = await getPublicProfileById(supabase, session.profile.id, session.profile.id);
  if (!profile) return null;

  return (
    <div className="pb-8">
      <div className="mx-auto flex w-full max-w-[520px] items-center justify-between px-5 pt-1">
        <p className="text-sm text-white/40">Preview</p>
        <Link href={DISCOVERY_ROUTES.meEdit}>
          <Button variant="secondary" size="sm">
            Edit profile
          </Button>
        </Link>
      </div>
      <PublicProfileView
        profile={profile}
        isOwner
        isLoggedIn
        source="direct"
        editHref={DISCOVERY_ROUTES.meEdit}
        showEditButton={false}
      />
    </div>
  );
}
