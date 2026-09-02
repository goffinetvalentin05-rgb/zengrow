import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileView } from "@/src/components/discovery/public-profile";
import { DiscoveryPageChrome } from "@/src/components/discovery/page-chrome";
import { getOptionalDiscoverySession } from "@/src/lib/discovery/auth";
import { resolveTrackedBioFromSourceCode } from "@/src/lib/discovery/attribution";
import { DISCOVERY_SOURCES, type DiscoverySource } from "@/src/lib/discovery/constants";
import { getProfileByUsername } from "@/src/lib/discovery/queries";
import { readUtmMedium, readUtmSource, sanitizeTrackingPlatform } from "@/src/lib/discovery/public-link";
import { DISCOVERY_ROUTES, profileHref } from "@/src/lib/discovery/routes";
import { isReservedProfileSlug, normalizePublicSlug } from "@/src/lib/discovery/slug";
import { absoluteUrl } from "@/src/lib/site-url";
import { createClient } from "@/src/lib/supabase/server";
import { getRequestLocale } from "@/src/i18n/server";
import { getMessages, interpolate } from "@/src/locales/app";

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
  const locale = await getRequestLocale();
  const t = getMessages(locale);
  if (!username || isReservedProfileSlug(username)) return { title: t.seo.profile };
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, username, bio")
    .eq("username", username)
    .maybeSingle();
  if (!data?.username) return { title: t.seo.profile };
  const name = data.display_name ?? `@${data.username}`;
  const description = data.bio || interpolate(t.seo.onSharpz, { name });
  const canonical = absoluteUrl(profileHref(data.username));
  return {
    title: name,
    description,
    alternates: { canonical },
    openGraph: {
      title: name,
      description,
      url: canonical,
      type: "profile",
    },
  };
}

export async function PublicProfileRoute({
  username: rawUsername,
  searchParams,
  sourceCode,
}: {
  username: string;
  searchParams: Promise<Search> | Search;
  sourceCode?: string;
}) {
  const username = normalizePublicSlug(rawUsername);
  if (!username || isReservedProfileSlug(username)) notFound();

  const fromPath = sourceCode !== undefined ? resolveTrackedBioFromSourceCode(sourceCode) : null;
  if (sourceCode !== undefined && !fromPath) notFound();

  const params = await searchParams;
  const supabase = await createClient();
  const session = await getOptionalDiscoverySession();
  const profile = await getProfileByUsername(supabase, username, session?.profile.id);
  if (!profile) notFound();

  const source = resolveSource(firstParam(params.from));
  const utmSource = fromPath?.utmSource ?? sanitizeTrackingPlatform(readUtmSource(params));
  const utmMedium = fromPath?.utmMedium ?? sanitizeTrackingPlatform(readUtmMedium(params));

  return (
    <DiscoveryPageChrome session={session}>
      <PublicProfileView
        profile={profile}
        isOwner={session?.profile.id === profile.id}
        isLoggedIn={Boolean(session)}
        source={source}
        utmSource={utmSource}
        utmMedium={utmMedium}
        editHref={DISCOVERY_ROUTES.meEdit}
      />
    </DiscoveryPageChrome>
  );
}
