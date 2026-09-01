"use client";

import Link from "next/link";
import { SOCIAL_PLATFORM_LABELS, type SocialPlatform } from "@/src/lib/discovery/constants";
import { formatLocation, normalizeHttpUrl, parseSocialHandle, resolveFeaturedThumbnail } from "@/src/lib/discovery/media";
import { profileHref } from "@/src/lib/discovery/routes";
import type { ProfileCardModel } from "@/src/lib/discovery/types";
import { FollowButton } from "@/src/components/discovery/follow-button";
import { initialsFromName } from "@/src/lib/discovery/slug";

export function ProfileDiscoveryCard({
  profile,
  source = "explore",
}: {
  profile: ProfileCardModel;
  source?: string;
}) {
  const href = profile.username ? `${profileHref(profile.username)}?from=${source}` : "#";
  const place = formatLocation(profile.location, profile.country);
  const meta = [profile.roleLabel || profile.primaryCategory?.name, place].filter(Boolean).join(" · ");
  const previewThumb = profile.featuredPreview
    ? resolveFeaturedThumbnail(profile.featuredPreview)
    : null;

  return (
    <article className="overflow-hidden bg-[#0d0c12] md:rounded-[1.75rem] md:border md:border-white/[0.06]">
      <Link href={href} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white/[0.04] sm:aspect-[5/4] md:aspect-[16/10]">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-end bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)] px-6 pb-8">
              <span className="font-[family-name:var(--font-zg-display)] text-7xl text-white/25">
                {initialsFromName(profile.displayName)}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      </Link>

      <div className="px-5 pb-6 pt-5 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} className="block">
              <h2 className="font-[family-name:var(--font-zg-display)] text-[1.85rem] leading-none tracking-tight text-white">
                {profile.displayName}
              </h2>
              {profile.username ? <p className="mt-1.5 text-sm text-white/40">@{profile.username}</p> : null}
            </Link>
            {meta ? <p className="mt-3 text-sm text-white/55">{meta}</p> : null}
          </div>
          <FollowButton profileId={profile.id} initialFollowing={profile.followedByMe} source={source} />
        </div>

        {profile.featuredProject ? (
          <p className="mt-5 text-[15px] text-white">
            <span className="mr-2 text-[11px] uppercase tracking-[0.16em] text-white/35">Building</span>
            {profile.featuredProject.name}
          </p>
        ) : null}

        {profile.bio ? <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-white/55">{profile.bio}</p> : null}

        {profile.socialLinks.length ? (
          <p className="mt-4 text-sm text-white/35">
            {profile.socialLinks.slice(0, 4).map((link, index) => {
              const label =
                link.platform === "other"
                  ? parseSocialHandle("website", link.url) || "Web"
                  : SOCIAL_PLATFORM_LABELS[link.platform as SocialPlatform] ?? link.platform;
              return (
                <span key={link.id}>
                  {index > 0 ? " · " : ""}
                  {label}
                </span>
              );
            })}
          </p>
        ) : null}

        {previewThumb ? (
          <a
            href={profile.featuredPreview?.url ? normalizeHttpUrl(profile.featuredPreview.url) : undefined}
            target="_blank"
            rel="noreferrer"
            className="mt-5 block overflow-hidden rounded-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewThumb} alt="" className="h-40 w-full object-cover" />
          </a>
        ) : null}

        <Link href={href} className="mt-5 inline-block text-sm text-white/45 hover:text-white">
          View profile
        </Link>
      </div>
    </article>
  );
}

export function PeopleFeed({
  profiles,
  source = "explore",
}: {
  profiles: ProfileCardModel[];
  source?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-8 md:max-w-[560px] md:gap-10">
      {profiles.map((profile) => (
        <ProfileDiscoveryCard key={profile.id} profile={profile} source={source} />
      ))}
    </div>
  );
}
