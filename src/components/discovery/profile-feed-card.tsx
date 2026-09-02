"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { resolveCardMedia } from "@/src/lib/discovery/card-visual";
import { formatAudienceSize, formatLocation, parseYoutubeId } from "@/src/lib/discovery/media";
import { persistExploreScroll, trackDiscoveryEvent } from "@/src/lib/discovery/track";
import { profileHref } from "@/src/lib/discovery/routes";
import type { ProfileCardModel } from "@/src/lib/discovery/types";
import { FollowButton } from "@/src/components/discovery/follow-button";
import { SaveButton } from "@/src/components/discovery/save-button";
import { ConnectButton } from "@/src/components/discovery/connect-button";
import { FadeImg } from "@/src/components/discovery/sz-ui";
import { initialsFromName } from "@/src/lib/discovery/slug";
import { useI18n } from "@/src/i18n/provider";
import { interpolate } from "@/src/locales/app";
import type { ProfileType } from "@/src/lib/discovery/constants";

function openProfile(profile: ProfileCardModel, source: string) {
  persistExploreScroll(`${window.location.pathname}${window.location.search}`);
  trackDiscoveryEvent({
    profileId: profile.id,
    eventType: "profile_open_from_discovery",
    source,
  });
}

function MediaFallback({ profile }: { profile: ProfileCardModel }) {
  const accent = profile.accentColor || "rgba(255,255,255,0.7)";
  const initial = initialsFromName(profile.displayName);
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0c]">
      <div className="sz-grain absolute inset-0 opacity-[0.14]" />
      <div
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
        style={{ background: accent, opacity: 0.22 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-[#050506]/25 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        {profile.avatarUrl ? (
          <FadeImg
            src={profile.avatarUrl}
            alt=""
            draggable={false}
            className="h-24 w-24 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white/[0.06] font-[family-name:var(--font-zg-display)] text-3xl text-white/80 ring-2 ring-white/10">
            {initial}
          </span>
        )}
      </div>
    </div>
  );
}

function YoutubeStage({
  youtubeUrl,
  posterUrl,
  active,
  label,
}: {
  youtubeUrl: string;
  posterUrl: string;
  active: boolean;
  label: string;
}) {
  const [playing, setPlaying] = useState(false);
  const videoId = parseYoutubeId(youtubeUrl);

  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);

  if (!videoId) {
    return <FadeImg src={posterUrl} alt="" draggable={false} className="h-full w-full object-cover" />;
  }

  return (
    <>
      <FadeImg src={posterUrl} alt="" draggable={false} className="h-full w-full object-cover" />
      {playing && active ? (
        <iframe
          title={label}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute left-1/2 top-1/2 z-[1] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur-md"
          aria-label={label}
        >
          <Play className="h-6 w-6 fill-white" />
        </button>
      )}
    </>
  );
}

export function ProfileFeedCard({
  profile,
  source = "explore",
  isLoggedIn = true,
  active = false,
  eager = false,
  showEnd = false,
}: {
  profile: ProfileCardModel;
  source?: string;
  isLoggedIn?: boolean;
  active?: boolean;
  eager?: boolean;
  showEnd?: boolean;
}) {
  const { t } = useI18n();
  const href = profile.username ? `${profileHref(profile.username)}?from=${source}` : "#";
  const place = formatLocation(profile.location, profile.country);
  const role =
    profile.profileType && t.roles[profile.profileType as ProfileType]
      ? t.roles[profile.profileType as ProfileType]
      : null;
  const niche = profile.primaryCategory?.name;
  const media = resolveCardMedia(profile);
  const accent = profile.accentColor;
  const followers = profile.followersCount > 0 ? formatAudienceSize(profile.followersCount) : null;
  const openAria = interpolate(t.explore.openProfile, { name: profile.displayName });
  const metaLine = [role, niche && niche !== role ? niche : null].filter(Boolean).join(" · ");
  const project = profile.featuredProject;
  const story = project?.description || (!project ? profile.bio : null);
  const stats = [followers ? `${followers} ${t.explore.followersShort}` : null, niche].filter(Boolean);

  return (
    <article className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#050506] md:bg-[#0c0c0e]">
      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#0a0a0c]">
        {media.heroUrl ? (
          media.heroKind === "youtube" && media.youtubeUrl ? (
            <YoutubeStage
              youtubeUrl={media.youtubeUrl}
              posterUrl={media.heroUrl}
              active={active}
              label={t.explore.playVideo}
            />
          ) : (
            <FadeImg
              src={media.heroUrl}
              alt=""
              draggable={false}
              loading={eager ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <MediaFallback profile={profile} />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050506] via-[#050506]/35 to-black/20 md:from-[#0c0c0e]" />

        {accent && media.heroUrl ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-70"
            style={{ boxShadow: `0 0 28px 2px ${accent}` }}
          />
        ) : null}

        {profile.discoveryBadge ? (
          <span className="pointer-events-none absolute left-4 top-[max(4.85rem,calc(env(safe-area-inset-top)+3.6rem))] rounded-full bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-950 md:top-4">
            {profile.discoveryBadge === "rising" ? t.badges.rising : t.badges.new}
          </span>
        ) : null}

        <Link
          href={href}
          onClick={() => openProfile(profile, source)}
          aria-label={openAria}
          className="absolute bottom-3 left-4 z-[1] md:bottom-4"
        >
          {profile.avatarUrl ? (
            <FadeImg
              src={profile.avatarUrl}
              alt=""
              draggable={false}
              className="h-12 w-12 rounded-full border-2 border-[#050506] object-cover md:border-[#0c0c0e]"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#050506] bg-white/[0.08] text-sm text-white/80 md:border-[#0c0c0e]">
              {initialsFromName(profile.displayName)}
            </span>
          )}
        </Link>

        {media.heroUrl && media.projectLogo ? (
          <FadeImg
            src={media.projectLogo}
            alt=""
            draggable={false}
            className="pointer-events-none absolute bottom-3 right-4 z-[1] h-11 w-11 rounded-2xl border border-white/15 bg-[#0c0c0e] object-cover md:bottom-4"
            style={accent ? { boxShadow: `0 0 0 1px ${accent}55` } : undefined}
          />
        ) : null}
      </div>

      <div className="min-w-0 shrink-0 px-5 pb-3 pt-3.5 md:px-6 md:pb-5">
        <Link href={href} onClick={() => openProfile(profile, source)} className="block min-w-0" aria-label={openAria}>
          <h2 className="sz-name truncate">{profile.displayName}</h2>
          {metaLine ? <p className="sz-body mt-1.5 truncate text-[0.875rem]">{metaLine}</p> : null}
          {place ? <p className="sz-meta mt-0.5 truncate">{place}</p> : null}
        </Link>

        {project ? (
          <div className="mt-3 min-w-0">
            <p className="sz-label">{t.profile.currentlyBuilding}</p>
            <p className="mt-1 truncate text-[1.05rem] leading-tight text-white">{project.name}</p>
            {story ? (
              <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-white/48">{story}</p>
            ) : null}
          </div>
        ) : profile.bio ? (
          <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-white/48">{profile.bio}</p>
        ) : null}

        <div className="mt-3.5 flex min-w-0 items-center gap-2">
          <FollowButton
            profileId={profile.id}
            initialFollowing={profile.followedByMe}
            source={source}
            silent
            isLoggedIn={isLoggedIn}
            className="min-w-0 flex-1 whitespace-nowrap"
          />
          <ConnectButton
            profileId={profile.id}
            initialStatus={profile.connectionStatus ?? "none"}
            isLoggedIn={isLoggedIn}
            silent
            className="min-w-0 flex-1 whitespace-nowrap"
          />
          <SaveButton
            profileId={profile.id}
            initialSaved={profile.savedByMe}
            source={source}
            isLoggedIn={isLoggedIn}
            silent
          />
        </div>

        {stats.length ? (
          <p className="sz-meta mt-2.5 truncate">{stats.join(" · ")}</p>
        ) : null}

        {showEnd ? <p className="sz-meta mt-3 text-center">{t.explore.end}</p> : null}
      </div>
    </article>
  );
}
