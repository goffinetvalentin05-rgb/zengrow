"use client";

import Link from "next/link";
import { SOCIAL_PLATFORM_LABELS, type SocialPlatform } from "@/src/lib/discovery/constants";
import {
  formatAudienceSize,
  formatLocation,
  resolveFeaturedThumbnail,
} from "@/src/lib/discovery/media";
import { persistExploreScroll, trackDiscoveryEvent } from "@/src/lib/discovery/track";
import { profileHref } from "@/src/lib/discovery/routes";
import type { ProfileCardModel } from "@/src/lib/discovery/types";
import { FollowButton } from "@/src/components/discovery/follow-button";
import { initialsFromName } from "@/src/lib/discovery/slug";
import { cn } from "@/src/lib/utils";

function visualSrc(profile: ProfileCardModel) {
  if (profile.coverImageUrl) return profile.coverImageUrl;
  const featured = profile.featuredPreview ? resolveFeaturedThumbnail(profile.featuredPreview) : null;
  if (featured) return featured;
  if (profile.avatarUrl) return profile.avatarUrl;
  return null;
}

function openProfile(profile: ProfileCardModel, source: string) {
  persistExploreScroll(`${window.location.pathname}${window.location.search}`);
  if (source === "search") {
    trackDiscoveryEvent({
      profileId: profile.id,
      eventType: "search_result_click",
      source: "search",
    });
  }
}

export function ProfileDiscoveryCard({
  profile,
  source = "explore",
  variant = "feed",
  isLoggedIn = true,
}: {
  profile: ProfileCardModel;
  source?: string;
  variant?: "feed" | "grid";
  isLoggedIn?: boolean;
}) {
  const href = profile.username ? `${profileHref(profile.username)}?from=${source}` : "#";
  const place = formatLocation(profile.location, profile.country);
  const role = profile.roleLabel || profile.primaryCategory?.name;
  const image = visualSrc(profile);
  const audience = formatAudienceSize(profile.audienceSize);
  const socials = profile.socialLinks.filter((link) => link.platform !== "website").slice(0, 3);

  return (
    <article
      className={cn(
        "overflow-hidden bg-[#0d0c12]",
        variant === "grid"
          ? "rounded-[1.6rem] border border-white/[0.06]"
          : "md:rounded-[1.6rem] md:border md:border-white/[0.06]",
      )}
    >
      <Link href={href} onClick={() => openProfile(profile, source)} className="block">
        <div
          className={cn(
            "relative w-full overflow-hidden bg-white/[0.04]",
            variant === "grid" ? "aspect-[16/10]" : "h-44 sm:h-48 md:h-52",
          )}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-end bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)] px-5 pb-6">
              <span className="font-[family-name:var(--font-zg-display)] text-6xl text-white/20">
                {initialsFromName(profile.displayName)}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0d0c12] to-transparent" />
          {profile.discoveryBadge ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-zinc-950">
              {profile.discoveryBadge === "rising" ? "Rising" : "New"}
            </span>
          ) : null}
          {profile.avatarUrl && image !== profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              loading="lazy"
              className="absolute bottom-3 left-4 h-12 w-12 rounded-full border-2 border-[#0d0c12] object-cover"
            />
          ) : null}
        </div>
      </Link>

      <div className="px-5 pb-5 pt-4 md:px-5">
        <Link href={href} onClick={() => openProfile(profile, source)} className="block">
          <h2 className="font-[family-name:var(--font-zg-display)] text-[1.65rem] leading-none tracking-tight text-white">
            {profile.displayName}
          </h2>
          {role ? <p className="mt-2 text-sm text-white/55">{role}</p> : null}
          {place ? <p className="mt-1 text-sm text-white/35">{place}</p> : null}
        </Link>

        {profile.featuredProject ? (
          <p className="mt-4 text-[15px] text-white">
            <span className="mr-2 text-[11px] uppercase tracking-[0.16em] text-white/35">Building</span>
            {profile.featuredProject.name}
          </p>
        ) : null}

        {profile.bio ? (
          <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-white/50">{profile.bio}</p>
        ) : null}

        <div className="mt-5 flex items-center gap-2">
          <FollowButton
            profileId={profile.id}
            initialFollowing={profile.followedByMe}
            source={source}
            silent
            isLoggedIn={isLoggedIn}
          />
          <Link
            href={href}
            onClick={() => openProfile(profile, source)}
            className="inline-flex min-h-9 items-center rounded-2xl border border-white/[0.1] px-4 text-[13px] text-white/70 hover:text-white"
          >
            View profile
          </Link>
        </div>

        {socials.length || audience ? (
          <p className="mt-4 text-sm text-white/35">
            {socials.map((link, index) => {
              const label =
                link.platform === "other"
                  ? "Web"
                  : SOCIAL_PLATFORM_LABELS[link.platform as SocialPlatform] ?? link.platform;
              return (
                <span key={link.id}>
                  {index > 0 ? " · " : ""}
                  {label}
                </span>
              );
            })}
            {audience ? (
              <span>
                {socials.length ? " · " : ""}
                {audience} followers
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function PeopleFeed({
  profiles,
  source = "explore",
  isLoggedIn = true,
}: {
  profiles: ProfileCardModel[];
  source?: string;
  isLoggedIn?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-7 md:mx-0 md:max-w-none md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-7">
      {profiles.map((profile) => (
        <ProfileDiscoveryCard
          key={profile.id}
          profile={profile}
          source={source}
          variant="feed"
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}
