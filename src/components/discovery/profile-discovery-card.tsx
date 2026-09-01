"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { SOCIAL_PLATFORM_LABELS, type SocialPlatform } from "@/src/lib/discovery/constants";
import { resolveCardMedia } from "@/src/lib/discovery/card-visual";
import { formatAudienceSize, formatLocation, normalizeHttpUrl } from "@/src/lib/discovery/media";
import { persistExploreScroll, trackDiscoveryEvent } from "@/src/lib/discovery/track";
import { profileHref } from "@/src/lib/discovery/routes";
import type { ProfileCardModel } from "@/src/lib/discovery/types";
import { FollowButton } from "@/src/components/discovery/follow-button";
import { SocialGlyph } from "@/src/components/discovery/social-glyph";
import { initialsFromName } from "@/src/lib/discovery/slug";
import { cn } from "@/src/lib/utils";

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
  variant?: "feed" | "grid" | "swipe";
  isLoggedIn?: boolean;
}) {
  const href = profile.username ? `${profileHref(profile.username)}?from=${source}` : "#";
  const place = formatLocation(profile.location, profile.country);
  const role = profile.roleLabel || profile.primaryCategory?.name;
  const niche = profile.primaryCategory?.name;
  const audience = formatAudienceSize(profile.audienceSize);
  const socials = profile.socialLinks.filter((link) => link.platform !== "website").slice(0, 3);
  const media = resolveCardMedia(profile);
  const swipe = variant === "swipe";

  return (
    <article
      className={cn(
        "overflow-hidden bg-[#121118]",
        swipe
          ? "rounded-[1.75rem] border border-white/[0.08] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)]"
          : variant === "grid"
            ? "rounded-[1.6rem] border border-white/[0.06]"
            : "md:rounded-[1.6rem] md:border md:border-white/[0.06]",
      )}
    >
      <div className={cn("relative overflow-hidden bg-white/[0.04]", swipe ? "aspect-[16/10]" : "h-44 sm:h-48 md:aspect-[16/10] md:h-auto")}>
        {media.heroUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.heroUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.14),transparent_42%),radial-gradient(circle_at_90%_80%,rgba(96,165,250,0.12),transparent_40%)]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121118] via-[#121118]/25 to-transparent" />

        {media.heroKind === "youtube" && media.youtubeUrl ? (
          <a
            href={normalizeHttpUrl(media.youtubeUrl)}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackDiscoveryEvent({
                profileId: profile.id,
                eventType: "featured_content_click",
                source: source === "search" ? "search" : source === "category" ? "category" : "explore",
                platform: "youtube",
                contentId: profile.featuredPreview?.id,
              })
            }
            className="absolute inset-0 flex items-center justify-center"
            aria-label="Watch on YouTube"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md ring-1 ring-white/20">
              <Play className="h-5 w-5 fill-white" />
            </span>
          </a>
        ) : (
          <Link href={href} onClick={() => openProfile(profile, source)} className="absolute inset-0" aria-label={profile.displayName} />
        )}

        {profile.discoveryBadge ? (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-zinc-950">
            {profile.discoveryBadge === "rising" ? "Rising" : "New"}
          </span>
        ) : null}

        <Link
          href={href}
          onClick={() => openProfile(profile, source)}
          className="absolute bottom-3 left-3 z-[1]"
        >
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              loading="lazy"
              className="h-12 w-12 rounded-full border-2 border-[#121118] object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#121118] bg-white/[0.08] text-sm text-white/80">
              {initialsFromName(profile.displayName)}
            </span>
          )}
        </Link>

        {media.projectLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.projectLogo}
            alt=""
            loading="lazy"
            className="pointer-events-none absolute bottom-3 right-3 z-[1] h-11 w-11 rounded-2xl border border-white/15 bg-[#0d0c12] object-cover"
          />
        ) : null}
      </div>

      <div className={cn("px-4 pb-4 pt-3", swipe ? "md:px-4" : "px-5 pb-5 pt-4")}>
        <Link href={href} onClick={() => openProfile(profile, source)} className="block">
          <h2 className="font-[family-name:var(--font-zg-display)] text-[1.55rem] leading-none tracking-tight text-white">
            {profile.displayName}
          </h2>
          <p className="mt-2 text-sm text-white/55">
            {[role, niche && niche !== role ? niche : null].filter(Boolean).join(" · ")}
          </p>
          {place ? <p className="mt-1 text-sm text-white/35">{place}</p> : null}
        </Link>

        {profile.featuredProject ? (
          <p className="mt-3 flex items-center gap-2 text-[15px] text-white">
            {media.projectLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.projectLogo} alt="" className="h-6 w-6 rounded-md object-cover" />
            ) : null}
            <span className="text-[11px] uppercase tracking-[0.16em] text-white/35">Building</span>
            <span className="truncate">{profile.featuredProject.name}</span>
          </p>
        ) : null}

        {profile.bio ? (
          <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-white/50">{profile.bio}</p>
        ) : null}

        <div className="mt-4 flex items-center gap-2">
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
            className="inline-flex min-h-9 items-center rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 text-[13px] text-white/70 hover:text-white"
          >
            View profile
          </Link>
        </div>

        {socials.length || audience ? (
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/35">
            {socials.map((link) => {
              const label =
                link.platform === "other"
                  ? "Web"
                  : SOCIAL_PLATFORM_LABELS[link.platform as SocialPlatform] ?? link.platform;
              return (
                <span key={link.id} className="inline-flex items-center gap-1">
                  <SocialGlyph platform={link.platform} className="h-3 w-3" />
                  {label}
                </span>
              );
            })}
            {audience ? <span>{audience}</span> : null}
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
          variant="grid"
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}
