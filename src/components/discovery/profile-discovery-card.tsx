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
import { FadeImg, ProjectStrip } from "@/src/components/discovery/sz-ui";
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

function CardFallback({ profile }: { profile: ProfileCardModel }) {
  const accent = profile.accentColor || "rgba(255,255,255,0.7)";
  const initial = initialsFromName(profile.displayName);
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0c]">
      <div className="sz-grain absolute inset-0 opacity-[0.14]" />
      <div
        className="absolute -right-10 -top-12 h-44 w-44 rounded-full blur-3xl"
        style={{ background: accent, opacity: 0.22 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/35 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        {profile.avatarUrl ? (
          <FadeImg
            src={profile.avatarUrl}
            alt=""
            className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.06] font-[family-name:var(--font-zg-display)] text-2xl text-white/80 ring-2 ring-white/10">
            {initial}
          </span>
        )}
      </div>
      {profile.featuredProject?.logoUrl ? (
        <FadeImg
          src={profile.featuredProject.logoUrl}
          alt=""
          className="absolute bottom-4 right-4 h-11 w-11 rounded-2xl object-cover ring-1 ring-white/15"
        />
      ) : null}
    </div>
  );
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
  const accent = profile.accentColor;

  return (
    <article
      className={cn(
        "sz-card overflow-hidden bg-[#121214]",
        swipe ? "shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)]" : "sz-card-hover",
      )}
    >
      <div
        className={cn(
          "sz-card-media relative bg-[#0a0a0c]",
          swipe ? "aspect-[16/10]" : "h-44 sm:h-48 md:aspect-[16/10] md:h-auto",
        )}
      >
        {media.heroUrl ? (
          <FadeImg src={media.heroUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <CardFallback profile={profile} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/20 to-transparent" />
        {accent && media.heroUrl ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-70"
            style={{ boxShadow: `0 0 28px 2px ${accent}` }}
          />
        ) : null}

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
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur-md transition-transform duration-150 active:scale-95">
              <Play className="h-5 w-5 fill-white" />
            </span>
          </a>
        ) : (
          <Link href={href} onClick={() => openProfile(profile, source)} className="absolute inset-0" aria-label={profile.displayName} />
        )}

        {profile.discoveryBadge ? (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-950">
            {profile.discoveryBadge === "rising" ? "Rising" : "New"}
          </span>
        ) : null}

        <Link href={href} onClick={() => openProfile(profile, source)} className="absolute bottom-3 left-3 z-[1]">
          {profile.avatarUrl ? (
            <FadeImg
              src={profile.avatarUrl}
              alt=""
              className="h-12 w-12 rounded-full border-2 border-[#121214] object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#121214] bg-white/[0.08] text-sm text-white/80">
              {initialsFromName(profile.displayName)}
            </span>
          )}
        </Link>

        {media.heroUrl && media.projectLogo ? (
          <FadeImg
            src={media.projectLogo}
            alt=""
            className="pointer-events-none absolute bottom-3 right-3 z-[1] h-11 w-11 rounded-2xl border border-white/15 bg-[#0c0c0e] object-cover"
            style={accent ? { boxShadow: `0 0 0 1px ${accent}55` } : undefined}
          />
        ) : null}
      </div>

      <div className={cn("px-4 pb-4 pt-3", swipe ? "md:px-4" : "px-5 pb-5 pt-4")}>
        <Link href={href} onClick={() => openProfile(profile, source)} className="block">
          <h2 className="sz-name">{profile.displayName}</h2>
          <p className="sz-body mt-2 text-[0.875rem]">
            {[role, niche && niche !== role ? niche : null].filter(Boolean).join(" · ")}
          </p>
          {place ? <p className="sz-meta mt-1">{place}</p> : null}
        </Link>

        {profile.featuredProject ? (
          <ProjectStrip
            className="mt-3"
            name={profile.featuredProject.name}
            logoUrl={media.heroUrl ? media.projectLogo : profile.featuredProject.logoUrl}
            status={profile.featuredProject.status}
            description={profile.featuredProject.description}
          />
        ) : null}

        {profile.bio ? (
          <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-white/48">{profile.bio}</p>
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
            className="sz-press inline-flex min-h-9 items-center rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 text-[13px] text-white/70 hover:border-white/18 hover:text-white"
          >
            View profile
          </Link>
        </div>

        {socials.length || audience ? (
          <p className="sz-meta mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
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
