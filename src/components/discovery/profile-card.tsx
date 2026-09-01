import Link from "next/link";
import { SOCIAL_PLATFORM_LABELS, type SocialPlatform } from "@/src/lib/discovery/constants";
import { profileHref } from "@/src/lib/discovery/routes";
import type { ProfileCardModel } from "@/src/lib/discovery/types";
import { FollowButton } from "@/src/components/discovery/follow-button";
import { SaveButton } from "@/src/components/discovery/save-button";
import { DiscoveryAvatar } from "@/src/components/discovery/avatar";
import { cn } from "@/src/lib/utils";

function formatFollowers(count: number) {
  if (count <= 0) return null;
  if (count < 1000) return `${count} on Sharpz`;
  return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k on Sharpz`;
}

export function ProfileCard({
  profile,
  source = "explore",
  variant = "default",
  showActions = true,
}: {
  profile: ProfileCardModel;
  source?: string;
  variant?: "default" | "featured" | "compact";
  showActions?: boolean;
}) {
  const href = profile.username ? profileHref(profile.username) : "#";
  const featured = variant === "featured";

  return (
    <article
      className={cn(
        "group flex h-full min-w-[260px] flex-col rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-white/[0.12] hover:bg-white/[0.04]",
        featured && "min-w-[300px] p-5 md:min-w-[340px]",
        variant === "compact" && "min-w-[220px] p-3",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Link href={href} className="flex min-w-0 items-center gap-3">
          <DiscoveryAvatar name={profile.displayName} src={profile.avatarUrl} size={featured ? "lg" : "md"} />
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{profile.displayName}</p>
            {profile.username ? (
              <p className="truncate text-sm text-white/40">@{profile.username}</p>
            ) : null}
          </div>
        </Link>
        {showActions ? <SaveButton profileId={profile.id} initialSaved={profile.savedByMe} /> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {profile.primaryCategory ? (
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/70">
            {profile.primaryCategory.name}
          </span>
        ) : null}
        {profile.roleLabel ? (
          <span className="rounded-full border border-white/[0.06] px-2.5 py-1 text-[11px] text-white/45">
            {profile.roleLabel}
          </span>
        ) : null}
      </div>

      {profile.featuredProject ? (
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">Building </span>
          <span className="font-medium text-white">{profile.featuredProject.name}</span>
        </p>
      ) : profile.bio ? (
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/55">{profile.bio}</p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <div className="min-w-0">
          {profile.location || profile.country ? (
            <p className="truncate text-xs text-white/40">{profile.location || profile.country}</p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-[0.12em] text-white/30">
            {profile.socialLinks.slice(0, 4).map((link) => (
              <span key={link.id}>
                {link.platform === "other" ? "Web" : SOCIAL_PLATFORM_LABELS[link.platform as SocialPlatform] ?? link.platform}
              </span>
            ))}
          </div>
          {formatFollowers(profile.followersCount) ? (
            <p className="mt-1 text-[11px] text-white/35">{formatFollowers(profile.followersCount)}</p>
          ) : null}
        </div>
        {showActions ? (
          <FollowButton profileId={profile.id} initialFollowing={profile.followedByMe} source={source} />
        ) : (
          <Link href={href} className="text-sm text-white/60 hover:text-white">
            View profile
          </Link>
        )}
      </div>
    </article>
  );
}
