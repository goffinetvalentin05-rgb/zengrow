import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileView } from "@/src/components/discovery/public-profile";
import { DiscoveryPageChrome } from "@/src/components/discovery/page-chrome";
import { getOptionalDiscoverySession } from "@/src/lib/discovery/auth";
import { DISCOVERY_SOURCES, type DiscoverySource } from "@/src/lib/discovery/constants";
import { getProfileByUsername } from "@/src/lib/discovery/queries";
import { readUtmSource, sanitizeTrackingPlatform } from "@/src/lib/discovery/public-link";
import { DISCOVERY_ROUTES, profileHref } from "@/src/lib/discovery/routes";
import { isReservedProfileSlug, normalizePublicSlug } from "@/src/lib/discovery/slug";
import { createClient } from "@/src/lib/supabase/server";

type Search = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveSource(from: string | undefined): DiscoverySource {
  if (from && DISCOVERY_SOURCES.includes(from as DiscoverySource)) return from as DiscoverySource;
  return "direct";
}

export async function generatePublicProfileMetadata(rawUsername: string): Promise<Metadata> {
  const username = normalizePublicSlug(rawUsername);
  if (!username || isReservedProfileSlug(username)) return { title: "Profile" };
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, username, bio")
    .eq("username", username)
    .maybeSingle();
  if (!data?.username) return { title: "Profile" };
  return {
    title: data.display_name ?? `@${data.username}`,
    description: data.bio || `${data.display_name} on Sharpz`,
    alternates: { canonical: profileHref(data.username) },
  };
}

export async function PublicProfileRoute({
  username: rawUsername,
  searchParams,
}: {
  username: string;
  searchParams: Promise<Search> | Search;
}) {
  const username = normalizePublicSlug(rawUsername);
  if (!username || isReservedProfileSlug(username)) notFound();

  const params = await searchParams;
  const supabase = await createClient();
  const session = await getOptionalDiscoverySession();
  const profile = await getProfileByUsername(supabase, username, session?.profile.id);
  if (!profile) notFound();

  const source = resolveSource(firstParam(params.from));
  const utmSource = sanitizeTrackingPlatform(readUtmSource(params));

  return (
    <DiscoveryPageChrome session={session}>
      <PublicProfileView
        profile={profile}
        isOwner={session?.profile.id === profile.id}
        isLoggedIn={Boolean(session)}
        source={source}
        utmSource={utmSource}
        editHref={DISCOVERY_ROUTES.meEdit}
      />
    </DiscoveryPageChrome>
  );
}
