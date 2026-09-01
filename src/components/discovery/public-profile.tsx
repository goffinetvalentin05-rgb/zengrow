"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  PROFILE_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  SOCIAL_PLATFORM_LABELS,
  type ProfileType,
  type SocialPlatform,
} from "@/src/lib/discovery/constants";
import { DISCOVERY_ROUTES, profileHref } from "@/src/lib/discovery/routes";
import { formatLocation, normalizeHttpUrl, parseSocialHandle } from "@/src/lib/discovery/media";
import {
  profileSectionOrder,
  profileThemeVars,
  resolveProfileLayout,
  resolveProfileTheme,
} from "@/src/lib/discovery/appearance";
import { readUtmMedium, readUtmSource, sanitizeTrackingPlatform } from "@/src/lib/discovery/public-link";
import { completenessSuggestions } from "@/src/lib/discovery/completeness";
import { trackDiscoveryEvent } from "@/src/lib/discovery/track";
import type { Project, PublicProfileModel } from "@/src/lib/discovery/types";
import { DiscoveryAvatar } from "@/src/components/discovery/avatar";
import { FollowButton } from "@/src/components/discovery/follow-button";
import { SaveButton } from "@/src/components/discovery/save-button";
import { ConnectionActions } from "@/src/components/discovery/connection-actions";
import { FeaturedContentCard } from "@/src/components/discovery/featured-content-card";
import { ShareProfileButton } from "@/src/components/discovery/share-profile-button";
import { ProfilePageBackdrop } from "@/src/components/discovery/profile-page-backdrop";
import { SocialMark } from "@/src/components/discovery/social-glyph";
import { FadeImg } from "@/src/components/discovery/sz-ui";
import Button from "@/src/components/ui/button";
import { initialsFromName } from "@/src/lib/discovery/slug";
import { cn } from "@/src/lib/utils";

const accentCta = {
  background: "var(--profile-accent)",
  color: "var(--profile-on-accent)",
} as const;

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
    const medium = sanitizeTrackingPlatform(readUtmMedium(window.location.search));
    trackDiscoveryEvent({
      profileId: profile.id,
      eventType: "profile_view",
      source,
      utmSource: utmSource || fromQuery,
      utmMedium: medium,
    });
  }, [isOwner, profile.id, source, utmSource]);

  const theme = resolveProfileTheme(profile.themeKey);
  const layout = resolveProfileLayout(profile.layoutVariant, profile.featuredFirst);
  const featured = profile.projects.find((item) => item.featuredProject) ?? profile.featuredProject ?? profile.projects[0];
  const otherProjects = profile.projects.filter((item) => item.id !== featured?.id);
  const extraNiches = profile.categories.filter((cat) => cat.id !== profile.primaryCategory?.id);
  const place = formatLocation(profile.location, profile.country);
  const niche = profile.primaryCategory?.name;
  const role =
    profile.profileType && PROFILE_TYPE_LABELS[profile.profileType as ProfileType]
      ? PROFILE_TYPE_LABELS[profile.profileType as ProfileType]
      : profile.roleLabel;
  const order = profileSectionOrder(layout, Boolean(featured), profile.featuredContent.length > 0);
  const suggestions = isOwner
    ? completenessSuggestions({
        profile,
        projects: profile.projects,
        socialLinks: profile.socialLinks,
        featuredContent: profile.featuredContent,
      })
    : [];

  function track(eventType: "featured_content_click" | "project_click" | "external_link_click", extra?: {
    platform?: string;
    contentId?: string;
    destination?: string;
  }) {
    trackDiscoveryEvent({
      profileId: profile.id,
      eventType,
      source,
      platform: extra?.platform,
      contentId: extra?.contentId,
      destination: extra?.destination,
    });
  }

  const building = featured ? (
    <BuildingCard
      project={featured}
      fallbackCategory={niche}
      onOpen={() =>
        featured.url &&
        track("project_click", { contentId: featured.id, platform: "project", destination: featured.url })
      }
    />
  ) : null;

  const featuredSection = profile.featuredContent.length ? (
    <section className="px-5">
      <h2 className="sz-title">Featured</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {profile.featuredContent.slice(0, 6).map((item) => (
          <FeaturedContentCard
            key={item.id}
            item={item}
            onClick={() =>
              track("featured_content_click", {
                contentId: item.id,
                platform: item.platform === "article" ? "other" : item.platform,
                destination: item.url,
              })
            }
          />
        ))}
      </div>
    </section>
  ) : null;

  const sections = {
    building,
    featured: featuredSection,
  };

  return (
    <div className="relative isolate min-h-[calc(100dvh-5.5rem)] w-full md:min-h-[calc(100dvh-3.5rem)]">
      <ProfilePageBackdrop pageKey={profile.pageBackgroundKey} imageUrl={profile.pageBackgroundImageUrl} />
      <div className="sz-app relative z-10 mx-auto w-full max-w-[520px] pb-20" style={profileThemeVars(theme, profile.accentColor)}>
      <header className="relative">
        <div className="relative h-[10.5rem] overflow-hidden sm:h-[12rem]">
          {profile.coverImageUrl ? (
            <FadeImg src={profile.coverImageUrl} alt="" loading="eager" className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `radial-gradient(ellipse 90% 80% at 50% -20%, var(--profile-hero-from), transparent 58%),
                  radial-gradient(ellipse 50% 60% at 88% 20%, var(--profile-glow), transparent 55%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {showOwnerBar ? (
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-3">
              <p className="sz-label text-white/55">Your page</p>
              <div className="flex items-center gap-2">
                {profile.username ? (
                  <Link href={profileHref(profile.username)} className="text-xs text-white/65 hover:text-white">
                    Public
                  </Link>
                ) : null}
                <Link href={editHref || DISCOVERY_ROUTES.meEdit}>
                  <Button variant="secondary" size="sm" className="rounded-full bg-black/40 backdrop-blur">
                    Edit profile
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative z-10 -mt-11 flex flex-col items-center px-5 text-center">
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-5 rounded-full blur-2xl"
              style={{ background: "var(--profile-glow)" }}
            />
            <DiscoveryAvatar
              name={profile.displayName}
              src={profile.avatarUrl}
              size="xl"
              className="relative h-[5.75rem] w-[5.75rem] text-3xl ring-[5px] ring-black/80 sm:h-[6.5rem] sm:w-[6.5rem]"
            />
          </div>

          <h1 className="sz-display mt-3.5 max-w-[18ch] break-words sm:text-[2.35rem]">
            {profile.displayName}
          </h1>
          {profile.username ? <p className="mt-2 text-[14px] text-white/40">@{profile.username}</p> : null}

          <div className="mt-3.5 flex max-w-full flex-wrap items-center justify-center gap-1.5">
            {niche ? <Chip>{niche}</Chip> : null}
            {role && role !== niche ? <Chip>{role}</Chip> : null}
            {place ? <Chip>{place}</Chip> : null}
          </div>

          {profile.bio ? (
            <p className="mx-auto mt-4 max-w-[34ch] text-[15px] leading-relaxed text-white/62">{profile.bio}</p>
          ) : null}

          {profile.followersCount > 0 ? (
            <p className="mt-3 text-sm text-white/35">
              {profile.followersCount} follower{profile.followersCount === 1 ? "" : "s"}
            </p>
          ) : null}

          <div className="mt-5 w-full max-w-[320px]">
            {isOwner ? (
              showOwnerBar ? (
                profile.username ? (
                  <ShareProfileButton username={profile.username} className="w-full min-h-11" />
                ) : null
              ) : (
                <div className="flex gap-2">
                  {profile.username ? (
                    <ShareProfileButton username={profile.username} className="min-h-11 flex-1" />
                  ) : null}
                  <Link href={editHref || DISCOVERY_ROUTES.meEdit} className="flex-1">
                    <Button variant="secondary" className="w-full min-h-11 rounded-full">
                      Edit profile
                    </Button>
                  </Link>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {isLoggedIn ? (
                    <FollowButton
                      profileId={profile.id}
                      initialFollowing={profile.followedByMe}
                      source={source}
                      size="md"
                      className="min-h-11 flex-1 rounded-full border-0"
                      style={accentCta}
                    />
                  ) : (
                    <Link href={DISCOVERY_ROUTES.signup} className="block flex-1">
                      <Button className="w-full min-h-11 rounded-full border-0" style={accentCta}>
                        Follow
                      </Button>
                    </Link>
                  )}
                  <SaveButton
                    profileId={profile.id}
                    initialSaved={profile.savedByMe}
                    source={source}
                    isLoggedIn={isLoggedIn}
                    silent
                    className="h-11 w-11 rounded-full"
                  />
                </div>
                <ConnectionActions
                  profileId={profile.id}
                  initialStatus={profile.connectionStatus ?? "none"}
                  socialLinks={profile.socialLinks}
                  email={profile.email}
                  isLoggedIn={isLoggedIn}
                  size="md"
                  className="w-full"
                  connectClassName="min-h-11 flex-1 rounded-full"
                  contactClassName="min-h-11 flex-1 rounded-full"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {showOwnerBar && isOwner ? (
        <OwnerCompleteness percent={profile.completeness} suggestions={suggestions} />
      ) : null}

      {profile.claimStatus === "unclaimed" ? (
        <p className="mt-6 px-5 text-center text-sm text-white/45">This profile is unclaimed.</p>
      ) : null}

      <div className="mt-9 flex flex-col gap-10">
        {order.map((key) => (
          <div key={key}>{sections[key]}</div>
        ))}

        {profile.socialLinks.length ? (
          <section className="px-5">
            <h2 className="sz-title">Where to find me</h2>
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
                    onClick={() =>
                      track("external_link_click", {
                        platform: link.platform,
                        contentId: link.id,
                        destination: link.url,
                      })
                    }
                    className="sz-press flex min-h-14 items-center gap-3 rounded-[1.15rem] bg-black/35 px-3.5 ring-1 ring-white/[0.08] backdrop-blur-md transition-colors duration-150 hover:bg-black/45 hover:ring-white/14"
                    style={{ boxShadow: "inset 0 0 0 1px var(--profile-ring)" }}
                  >
                    <SocialMark platform={link.platform} />
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-[15px] text-white">{label}</span>
                      <span className="block truncate text-sm text-white/40">{subtitle}</span>
                    </span>
                    <span className="text-white/30">→</span>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}

        {extraNiches.length || otherProjects.length ? (
          <section className="px-5">
            <h2 className="sz-title">More about</h2>
            {extraNiches.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm",
                      cat.id === profile.primaryCategory?.id
                        ? "text-[#08070b]"
                        : "bg-white/[0.06] text-white/70",
                    )}
                    style={cat.id === profile.primaryCategory?.id ? accentCta : undefined}
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
                    onClick={() =>
                      project.url &&
                      track("project_click", { contentId: project.id, platform: "project", destination: project.url })
                    }
                    className="flex items-start gap-3 rounded-[1.15rem] bg-black/35 px-4 py-3.5 ring-1 ring-white/[0.07] backdrop-blur-md transition-colors duration-150 hover:ring-white/12"
                  >
                    <ProjectLogoMark name={project.name} logoUrl={project.logoUrl} size="sm" />
                    <span className="min-w-0 flex-1">
                      <p className="text-white">{project.name}</p>
                      {project.description ? <p className="mt-1 line-clamp-2 text-sm text-white/45">{project.description}</p> : null}
                    </span>
                  </a>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
    </div>
  );
}

function ProjectLogoMark({
  name,
  logoUrl,
  size = "lg",
}: {
  name: string;
  logoUrl: string | null;
  size?: "sm" | "lg";
}) {
  const initial = initialsFromName(name);
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-black/50 ring-1 ring-white/10",
        size === "lg" ? "h-14 w-14 rounded-2xl" : "h-10 w-10 rounded-xl",
      )}
    >
      {logoUrl ? (
        <FadeImg src={logoUrl} alt="" className={cn("h-full w-full object-contain", size === "lg" ? "p-1.5" : "p-1")} />
      ) : (
        <span
          className={cn("font-medium tracking-tight", size === "lg" ? "text-lg" : "text-sm")}
          style={{ color: "var(--profile-accent, #f4f4f5)" }}
        >
          {initial}
        </span>
      )}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="max-w-full truncate rounded-full bg-black/40 px-3 py-1 text-xs text-white/75 ring-1 ring-white/[0.06] backdrop-blur-md">
      {children}
    </span>
  );
}

function BuildingCard({
  project,
  fallbackCategory,
  onOpen,
}: {
  project: Project;
  fallbackCategory?: string | null;
  onOpen: () => void;
}) {
  const href = project.url ? normalizeHttpUrl(project.url) : undefined;
  const Tag = href ? "a" : "div";
  const category = project.category || fallbackCategory;

  return (
    <section className="px-5">
      <p className="sz-label">Currently building</p>
      <Tag
        href={href}
        target={href ? "_blank" : undefined}
        rel={href ? "noreferrer" : undefined}
        onClick={href ? onOpen : undefined}
        className="sz-press mt-3 block overflow-hidden rounded-[1.6rem] ring-1 ring-white/[0.08] backdrop-blur-md"
        style={{
          background: `linear-gradient(165deg, color-mix(in srgb, var(--profile-glow) 38%, rgba(0,0,0,0.28)), rgba(0,0,0,0.28))`,
        }}
      >
        <div className="flex items-center gap-3.5 px-4 pt-4 sm:px-5 sm:pt-5">
          <ProjectLogoMark name={project.name} logoUrl={project.logoUrl} size="lg" />
          <div className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              {category ? (
                <span className="text-[11px] uppercase tracking-[0.14em] text-white/45">{category}</span>
              ) : null}
              <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] text-white/60">
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
            </div>
            <h2 className="sz-name mt-1 truncate">{project.name}</h2>
          </div>
        </div>
        {project.description ? (
          <p className="px-4 pb-1 pt-3 text-[15px] leading-relaxed text-white/58 sm:px-5">{project.description}</p>
        ) : null}
        {href ? (
          <p className="px-4 pb-4 pt-3 text-sm sm:px-5" style={{ color: "var(--profile-accent)" }}>
            Open project →
          </p>
        ) : (
          <div className="h-4" />
        )}
      </Tag>
    </section>
  );
}

function OwnerCompleteness({
  percent,
  suggestions,
}: {
  percent: number;
  suggestions: { key: string; label: string; href: string }[];
}) {
  return (
    <div className="mx-5 mt-7 rounded-[1.25rem] bg-black/35 px-4 py-3.5 ring-1 ring-white/[0.08] backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <p className="sz-label">Profile completeness</p>
        <p className="text-sm text-white">{percent}%</p>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, percent)}%`, background: "var(--profile-accent)" }}
        />
      </div>
      {suggestions.length ? (
        <ul className="mt-3 space-y-1">
          {suggestions.slice(0, 3).map((item) => (
            <li key={item.key}>
              <a href={item.href} className="text-sm text-white/50 hover:text-white">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
