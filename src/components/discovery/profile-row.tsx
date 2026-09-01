import Link from "next/link";
import { FollowButton } from "@/src/components/discovery/follow-button";
import { DiscoveryAvatar } from "@/src/components/discovery/avatar";
import { formatLocation } from "@/src/lib/discovery/media";
import { profileHref } from "@/src/lib/discovery/routes";
import type { ProfileCardModel } from "@/src/lib/discovery/types";

export function ProfileRow({
  profile,
  source = "search",
}: {
  profile: ProfileCardModel;
  source?: string;
}) {
  const href = profile.username ? `${profileHref(profile.username)}?from=${source}` : "#";
  const place = formatLocation(profile.location, profile.country);
  const building = profile.featuredProject?.name;

  return (
    <div className="flex items-center gap-3 py-3">
      <Link href={href} className="shrink-0">
        <DiscoveryAvatar name={profile.displayName} src={profile.avatarUrl} size="md" />
      </Link>
      <Link href={href} className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{profile.displayName}</p>
        <p className="truncate text-sm text-white/40">
          {profile.username ? `@${profile.username}` : ""}
          {profile.primaryCategory ? ` · ${profile.primaryCategory.name}` : ""}
          {building ? ` · ${building}` : ""}
          {place ? ` · ${place}` : ""}
        </p>
      </Link>
      <FollowButton profileId={profile.id} initialFollowing={profile.followedByMe} source={source} size="sm" />
    </div>
  );
}
