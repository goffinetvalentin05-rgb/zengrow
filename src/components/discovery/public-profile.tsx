"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SOCIAL_PLATFORM_LABELS, type SocialPlatform } from "@/src/lib/discovery/constants";
import { DISCOVERY_ROUTES, profileHref } from "@/src/lib/discovery/routes";
import { formatLocation, normalizeHttpUrl, parseSocialHandle } from "@/src/lib/discovery/media";
import { profileThemeVars, resolveProfileTheme } from "@/src/lib/discovery/appearance";
import { readUtmSource, sanitizeTrackingPlatform } from "@/src/lib/discovery/public-link";
import type { PublicProfileModel } from "@/src/lib/discovery/types";
import { DiscoveryAvatar } from "@/src/components/discovery/avatar";
import { FollowButton } from "@/src/components/discovery/follow-button";
import { FeaturedContentCard } from "@/src/components/discovery/featured-content-card";
import { ShareProfileButton } from "@/src/components/discovery/share-profile-button";
import { SocialGlyph } from "@/src/components/discovery/social-glyph";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export function PublicProfileView({
  profile,
  isOwner,
  isLoggedIn,
  source = "direct",
  utmSource,
  editHref,
  showOwnerBar = false,
}: {
  profile: PublicProfileModel;
  isOwner: boolean;
  isLoggedIn: boolean;
  source?: string;
  utmSource?: string | null;
  editHref?: string;
  showOwnerBar?: boolean;
}) {
  useEffect(() => {
    if (isOwner) return;
    const fromQuery = sanitizeTrackingPlatform(readUtmSource(window.location.search));
    const platform = utmSource || fromQuery || undefined;
    void fetch("/api/discovery/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profile.id,
        eventType: "profile_view",
        source,
        platform,
      }),
    });
  }, [isOwner, profile.id, source, utmSource]);

  const theme = resolveProfileTheme(profile.themeKey);
  const featured = profile.projects.find((item) => item.featuredProject) ?? profile.featuredProject ?? profile.projects[0];
  const otherProjects = profile.projects.filter((item) => item.id !== featured?.id);
  const extraNiches = profile.categories.filter((cat) => cat.id !== profile.primaryCategory?.id);
  const place = formatLocation(profile.location, profile.country);
  const role = profile.primaryCategory?.name || profile.roleLabel;
  const showFeaturedFirst = profile.featuredFirst && profile.featuredContent.length > 0;

  async function track(eventType: string, extra?: Record<string, unknown>) {
    await fetch("/api/discovery/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: profile.id, eventType, source, ...extra }),
    });
  }

  const building = featured ? (
    <section className="px-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Currently building</p>
      <a
        href={featured.url ? normalizeHttpUrl(featured.url) : undefined}
        target={featured.url ? "_blank" : undefined}
        rel="noreferrer"
        onClick={() => featured.url && track("project_click", { contentId: featured.id, platform: "website" })}
        className="mt-3 block overflow-hidden rounded-[1.5rem] p-5 ring-1 ring-white/[0.07]"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, var(--profile-glow) 35%, transparent), rgba(255,255,255,0.03))`,
        }}
      >
        {featured.category || profile.primaryCategory?.name ? (
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
            {featured.category || profile.primaryCategory?.name}
          </p>
        ) : null}
        <h2 className="mt-2 font-[family-name:var(--font-zg-display)] text-[2rem] leading-none tracking-tight text-white">
          {featured.name}
        </h2>
        {featured.description ? (
          <p className="mt-3 text-[15px] leading-relaxed text-white/55">{featured.description}</p>
        ) : null}
      </a>
    </section>
  ) : null;

  const featuredSection = profile.featuredContent.length ? (
    <section>
      <div className="px-5">
        <h2 className="font-[family-name:var(--font-zg-display)] text-2xl text-white">Featured</h2>
      </div>
      {profile.featuredContent.length === 1 ? (
        <div className="mt-4 px-5">
          <FeaturedContentCard
            item={profile.featuredContent[0]}
            onClick={() =>
              track("featured_content_click", {
                contentId: profile.featuredContent[0].id,
                platform: profile.featuredContent[0].platform,
              })
            }
          />
        </div>
      ) : (
        <div className="mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {profile.featuredContent.map((item) => (
            <FeaturedContentCard
              key={item.id}
              item={item}
              className="w-[min(86vw,360px)] shrink-0 snap-start"
              onClick={() => track("featured_content_click", { contentId: item.id, platform: item.platform })}
            />
          ))}
        </div>
      )}
    </section>
  ) : null;

  return (
    <div className="relative mx-auto w-full max-w-[560px] pb-16" style={profileThemeVars(theme)}>
      <header className="relative">
        <div className="relative h-48 overflow-hidden sm:h-56">
          {profile.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.coverImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `radial-gradient(ellipse 80% 90% at 50% -10%, var(--profile-hero-from), transparent 62%),
                  linear-gradient(180deg, var(--profile-hero-via), var(--profile-hero-to))`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08070b] via-[#08070b]/35 to-transparent" />
          {showOwnerBar ? (
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/55">Preview</p>
              <div className="flex items-center gap-3">
                {profile.username ? <ShareProfileButton username={profile.username} variant="ghost" size="sm" className="text-white/70" /> : null}
                {profile.username ? (
                  <Link href={profileHref(profile.username)} className="text-xs text-white/60 hover:text-white">
                    Public profile
                  </Link>
                ) : null}
                <Link href={editHref || DISCOVERY_ROUTES.meEdit}>
                  <Button variant="secondary" size="sm" className="rounded-full bg-black/35 backdrop-blur">
                    Edit profile
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative z-10 -mt-12 flex flex-col items-center px-5 text-center">
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-4 rounded-full blur-2xl"
              style={{ background: "var(--profile-glow)" }}
            />
            <DiscoveryAvatar
              name={profile.displayName}
              src={profile.avatarUrl}
              size="xl"
              className="relative h-[6.5rem] w-[6.5rem] text-3xl ring-4 ring-[#08070b]"
            />
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-zg-display)] text-[2.5rem] leading-none tracking-tight text-white">
            {profile.displayName}
          </h1>
          {profile.username ? <p className="mt-2 text-[15px] text-white/40">@{profile.username}</p> : null}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {role ? <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/70">{role}</span> : null}
            {place ? <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/70">{place}</span> : null}
          </div>

          {profile.followersCount > 0 ? (
            <p className="mt-3 text-sm text-white/40">
              {profile.followersCount} follower{profile.followersCount === 1 ? "" : "s"}
            </p>
          ) : null}

          <div className="mt-5 w-full max-w-[240px]">
            {isOwner ? (
              showOwnerBar ? null : (
                <div className="flex flex-col gap-2">
                  {profile.username ? <ShareProfileButton username={profile.username} className="w-full" /> : null}
                  <Link href={editHref || DISCOVERY_ROUTES.meEdit} className="block">
                    <Button variant="secondary" className="w-full rounded-full">
                      Edit profile
                    </Button>
                  </Link>
                </div>
              )
            ) : isLoggedIn ? (
              <FollowButton
                profileId={profile.id}
                initialFollowing={profile.followedByMe}
                source={source}
                size="md"
                className="w-full rounded-full"
              />
            ) : (
              <Link href={DISCOVERY_ROUTES.signup} className="block">
                <Button className="w-full rounded-full">Follow</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {profile.claimStatus === "unclaimed" ? (
        <p className="mt-6 px-5 text-center text-sm text-white/45">This profile is unclaimed.</p>
      ) : null}

      {profile.bio ? (
        <p className="mx-auto mt-7 max-w-[36ch] px-5 text-center text-[15px] leading-relaxed text-white/60">
          {profile.bio}
        </p>
      ) : null}

      <div className="mt-10 flex flex-col gap-11">
        {showFeaturedFirst ? featuredSection : building}
        {showFeaturedFirst ? building : featuredSection}

        {profile.socialLinks.length ? (
          <section className="px-5">
            <h2 className="font-[family-name:var(--font-zg-display)] text-2xl text-white">Where to find me</h2>
            <div className="mt-4 space-y-2">
              {profile.socialLinks.map((link) => {
                const handle = parseSocialHandle(link.platform, link.url);
                const label =
                  link.platform === "other" ? "Web" : SOCIAL_PLATFORM_LABELS[link.platform as SocialPlatform] ?? link.platform;
                const subtitle =
                  link.platform === "website" || link.platform === "other"
                    ? handle || "Open"
                    : handle
                      ? `@${handle}`
                      : "Open";
                return (
                  <a
                    key={link.id}
                    href={normalizeHttpUrl(link.url)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => track("external_link_click", { platform: link.platform })}
                    className="flex items-center gap-3 rounded-2xl bg-white/[0.035] px-3.5 py-3 ring-1 ring-white/[0.05] transition hover:bg-white/[0.055]"
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06]"
                      style={{ color: "var(--profile-accent)" }}
                    >
                      <SocialGlyph platform={link.platform} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-[15px] text-white">{label}</span>
                      <span className="block truncate text-sm text-white/40">{subtitle}</span>
                    </span>
                    <span className="text-white/25">→</span>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}

        {extraNiches.length || otherProjects.length ? (
          <section className="px-5">
            <h2 className="font-[family-name:var(--font-zg-display)] text-2xl text-white">More about</h2>
            {extraNiches.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm",
                      cat.id === profile.primaryCategory?.id ? "bg-white text-zinc-950" : "bg-white/[0.06] text-white/70",
                    )}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            ) : null}
            {otherProjects.length ? (
              <div className="mt-4 space-y-2">
                {otherProjects.map((project) => (
                  <a
                    key={project.id}
                    href={project.url ? normalizeHttpUrl(project.url) : undefined}
                    target={project.url ? "_blank" : undefined}
                    rel="noreferrer"
                    className="block rounded-2xl bg-white/[0.035] px-4 py-3.5"
                  >
                    <p className="text-white">{project.name}</p>
                    {project.description ? <p className="mt-1 text-sm text-white/45">{project.description}</p> : null}
                  </a>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
