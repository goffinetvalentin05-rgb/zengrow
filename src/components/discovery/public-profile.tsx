"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SOCIAL_PLATFORM_LABELS, type SocialPlatform } from "@/src/lib/discovery/constants";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { formatLocation, normalizeHttpUrl, parseSocialHandle } from "@/src/lib/discovery/media";
import type { PublicProfileModel } from "@/src/lib/discovery/types";
import { DiscoveryAvatar } from "@/src/components/discovery/avatar";
import { FollowButton } from "@/src/components/discovery/follow-button";
import { FeaturedContentCard } from "@/src/components/discovery/featured-content-card";
import Button from "@/src/components/ui/button";

export function PublicProfileView({
  profile,
  isOwner,
  isLoggedIn,
  source = "direct",
  editHref,
  showEditButton = true,
}: {
  profile: PublicProfileModel;
  isOwner: boolean;
  isLoggedIn: boolean;
  source?: string;
  editHref?: string;
  showEditButton?: boolean;
}) {
  useEffect(() => {
    if (isOwner) return;
    void fetch("/api/discovery/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profile.id,
        eventType: "profile_view",
        source,
      }),
    });
  }, [isOwner, profile.id, source]);

  const featured = profile.projects.find((item) => item.featuredProject) ?? profile.featuredProject ?? profile.projects[0];
  const otherProjects = profile.projects.filter((item) => item.id !== featured?.id);
  const place = formatLocation(profile.location, profile.country);
  const meta = [profile.primaryCategory?.name || profile.roleLabel, place].filter(Boolean).join(" · ");

  async function track(eventType: string, extra?: Record<string, unknown>) {
    await fetch("/api/discovery/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: profile.id, eventType, source, ...extra }),
    });
  }

  return (
    <div className="mx-auto w-full max-w-[520px] pb-16">
      <div className="flex flex-col items-center px-5 pt-4 text-center">
        <DiscoveryAvatar name={profile.displayName} src={profile.avatarUrl} size="xl" className="h-28 w-28 text-3xl" />
        <h1 className="mt-4 font-[family-name:var(--font-zg-display)] text-4xl text-white">{profile.displayName}</h1>
        {profile.username ? <p className="mt-1 text-white/40">@{profile.username}</p> : null}
        {meta ? <p className="mt-3 text-sm text-white/50">{meta}</p> : null}

        <div className="mt-5 flex items-center gap-2">
          {isOwner ? (
            showEditButton ? (
              <Link href={editHref || DISCOVERY_ROUTES.meEdit}>
                <Button variant="secondary">Edit profile</Button>
              </Link>
            ) : null
          ) : isLoggedIn ? (
            <FollowButton profileId={profile.id} initialFollowing={profile.followedByMe} source={source} size="md" />
          ) : (
            <Link href={DISCOVERY_ROUTES.signup}>
              <Button>Follow</Button>
            </Link>
          )}
        </div>
      </div>

      {profile.claimStatus === "unclaimed" ? (
        <p className="mt-6 px-5 text-center text-sm text-white/45">This profile is unclaimed.</p>
      ) : null}

      {profile.bio ? (
        <p className="mt-8 px-5 text-[15px] leading-relaxed text-white/70">{profile.bio}</p>
      ) : null}

      {featured ? (
        <section className="mt-10 px-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">Currently building</p>
          <a
            href={featured.url ? normalizeHttpUrl(featured.url) : undefined}
            target={featured.url ? "_blank" : undefined}
            rel="noreferrer"
            onClick={() => featured.url && track("project_click", { contentId: featured.id, platform: "website" })}
            className="mt-3 block rounded-[1.6rem] bg-white/[0.04] p-5"
          >
            <h2 className="font-[family-name:var(--font-zg-display)] text-3xl text-white">{featured.name}</h2>
            {featured.description ? <p className="mt-2 text-sm leading-relaxed text-white/50">{featured.description}</p> : null}
          </a>
        </section>
      ) : null}

      {profile.featuredContent.length ? (
        <section className="mt-10 px-5">
          <h2 className="font-[family-name:var(--font-zg-display)] text-2xl text-white">Featured</h2>
          <div className="mt-4 grid gap-4">
            {profile.featuredContent.map((item) => (
              <FeaturedContentCard
                key={item.id}
                item={item}
                onClick={() => track("featured_content_click", { contentId: item.id, platform: item.platform })}
              />
            ))}
          </div>
        </section>
      ) : null}

      {profile.socialLinks.length ? (
        <section className="mt-10 px-5">
          <h2 className="font-[family-name:var(--font-zg-display)] text-2xl text-white">Where to find me</h2>
          <div className="mt-4 divide-y divide-white/[0.06]">
            {profile.socialLinks.map((link) => {
              const handle = parseSocialHandle(link.platform, link.url);
              const label = link.platform === "other" ? "Web" : SOCIAL_PLATFORM_LABELS[link.platform as SocialPlatform] ?? link.platform;
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
                  className="flex items-center justify-between py-3.5 text-[15px]"
                >
                  <span className="text-white">{label}</span>
                  <span className="text-white/40">{subtitle}</span>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      {otherProjects.length ? (
        <section className="mt-10 px-5">
          <h2 className="font-[family-name:var(--font-zg-display)] text-2xl text-white">Projects</h2>
          <div className="mt-4 space-y-3">
            {otherProjects.map((project) => (
              <a
                key={project.id}
                href={project.url ? normalizeHttpUrl(project.url) : undefined}
                target={project.url ? "_blank" : undefined}
                rel="noreferrer"
                className="block rounded-2xl bg-white/[0.04] p-4"
              >
                <p className="text-white">{project.name}</p>
                {project.description ? <p className="mt-1 text-sm text-white/45">{project.description}</p> : null}
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
