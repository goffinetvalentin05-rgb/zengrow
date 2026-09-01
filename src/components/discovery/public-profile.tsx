"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FEATURED_PLATFORM_LABELS, SOCIAL_PLATFORM_LABELS, type SocialPlatform } from "@/src/lib/discovery/constants";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import type { PublicProfileModel } from "@/src/lib/discovery/types";
import { DiscoveryAvatar } from "@/src/components/discovery/avatar";
import { FollowButton } from "@/src/components/discovery/follow-button";
import { SaveButton } from "@/src/components/discovery/save-button";
import Button from "@/src/components/ui/button";

export function PublicProfileView({
  profile,
  isOwner,
  isLoggedIn,
  source = "direct",
}: {
  profile: PublicProfileModel;
  isOwner: boolean;
  isLoggedIn: boolean;
  source?: string;
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

  async function track(eventType: string, extra?: Record<string, unknown>) {
    await fetch("/api/discovery/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: profile.id, eventType, source, ...extra }),
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-16">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <DiscoveryAvatar name={profile.displayName} src={profile.avatarUrl} size="xl" />
          <div>
            <h1 className="font-[family-name:var(--font-zg-display)] text-4xl text-white">{profile.displayName}</h1>
            {profile.username ? <p className="text-white/40">@{profile.username}</p> : null}
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/50">
              {profile.primaryCategory ? <span>{profile.primaryCategory.name}</span> : null}
              {profile.roleLabel ? <span>{profile.roleLabel}</span> : null}
              {profile.location || profile.country ? <span>{profile.location || profile.country}</span> : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwner ? (
            <Link href={DISCOVERY_ROUTES.me}>
              <Button variant="secondary">Edit profile</Button>
            </Link>
          ) : isLoggedIn ? (
            <>
              <SaveButton profileId={profile.id} initialSaved={profile.savedByMe} />
              <FollowButton profileId={profile.id} initialFollowing={profile.followedByMe} source={source} />
            </>
          ) : (
            <Link href={DISCOVERY_ROUTES.signup}>
              <Button>Follow</Button>
            </Link>
          )}
        </div>
      </div>

      {profile.claimStatus === "unclaimed" ? (
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white/60">
          This profile is unclaimed.
          {isLoggedIn ? (
            <ClaimButton profileId={profile.id} />
          ) : (
            <span>
              {" "}
              <Link href={DISCOVERY_ROUTES.signup} className="text-white underline-offset-4 hover:underline">
                Claim this profile
              </Link>
            </span>
          )}
        </div>
      ) : null}

      {profile.bio ? <p className="mt-6 text-base leading-relaxed text-white/70">{profile.bio}</p> : null}

      <p className="mt-4 text-sm text-white/35">
        {profile.followersCount} followers · {profile.followingCount} following
      </p>

      {profile.socialLinks.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {profile.socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("external_link_click", { platform: link.platform })}
              className="rounded-full border border-white/[0.08] px-3 py-1.5 text-sm text-white/70 hover:text-white"
            >
              {link.platform === "other" ? "Web" : SOCIAL_PLATFORM_LABELS[link.platform as SocialPlatform] ?? link.platform}
            </a>
          ))}
        </div>
      ) : null}

      {featured ? (
        <section className="mt-12">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">Currently building</p>
          <a
            href={featured.url || undefined}
            target={featured.url ? "_blank" : undefined}
            rel="noreferrer"
            onClick={() => featured.url && track("project_click", { contentId: featured.id, platform: "website" })}
            className="mt-3 block rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6"
          >
            <h2 className="font-[family-name:var(--font-zg-display)] text-3xl text-white">{featured.name}</h2>
            {featured.description ? <p className="mt-2 text-sm leading-relaxed text-white/55">{featured.description}</p> : null}
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/35">
              {featured.category} · {featured.status}
            </p>
          </a>
        </section>
      ) : null}

      {otherProjects.length ? (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-zg-display)] text-2xl text-white">Projects</h2>
          <div className="mt-4 grid gap-3">
            {otherProjects.map((project) => (
              <a
                key={project.id}
                href={project.url || undefined}
                target={project.url ? "_blank" : undefined}
                rel="noreferrer"
                onClick={() => project.url && track("project_click", { contentId: project.id, platform: "website" })}
                className="rounded-2xl border border-white/[0.07] p-4"
              >
                <p className="text-white">{project.name}</p>
                {project.description ? <p className="mt-1 text-sm text-white/45">{project.description}</p> : null}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {profile.featuredContent.length ? (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-zg-display)] text-2xl text-white">Find me online</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {profile.featuredContent.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  track("featured_content_click", { contentId: item.id, platform: item.platform })
                }
                className="overflow-hidden rounded-2xl border border-white/[0.07]"
              >
                {item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnailUrl} alt="" className="h-36 w-full object-cover" />
                ) : null}
                <div className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">
                    {FEATURED_PLATFORM_LABELS[item.platform]}
                  </p>
                  <p className="mt-1 text-sm text-white">{item.title || item.url}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ClaimButton({ profileId }: { profileId: string }) {
  async function claim() {
    await fetch("/api/discovery/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, proofNote: "I control this identity." }),
    });
    alert("Claim request sent. An admin will review it.");
  }
  return (
    <button type="button" className="ml-2 underline underline-offset-4" onClick={claim}>
      Claim this profile
    </button>
  );
}
