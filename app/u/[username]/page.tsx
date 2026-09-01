import type { Metadata } from "next";
import { PublicProfileView } from "@/src/components/discovery/public-profile";
import { DiscoveryPageChrome } from "@/src/components/discovery/page-chrome";
import { getOptionalDiscoverySession } from "@/src/lib/discovery/auth";
import { getProfileByUsername } from "@/src/lib/discovery/queries";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { createClient } from "@/src/lib/supabase/server";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { username } = await params;
  const { from } = await searchParams;
  const supabase = await createClient();
  const session = await getOptionalDiscoverySession();
  const profile = await getProfileByUsername(supabase, username, session?.profile.id);
  if (!profile) notFound();
  const source =
    from === "explore" || from === "search" || from === "category" || from === "following" || from === "saved"
      ? from
      : "direct";

  return (
    <DiscoveryPageChrome session={session}>
      <PublicProfileView
        profile={profile}
        isOwner={session?.profile.id === profile.id}
        isLoggedIn={Boolean(session)}
        source={source}
        editHref={DISCOVERY_ROUTES.meEdit}
      />
    </DiscoveryPageChrome>
  );
}
