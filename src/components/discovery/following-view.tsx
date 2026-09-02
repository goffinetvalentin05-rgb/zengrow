"use client";

import { ConnectionRequests } from "@/src/components/discovery/connection-requests";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
import { DiscoveryPageHeader } from "@/src/components/discovery/sz-ui";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import type { ProfileCardModel } from "@/src/lib/discovery/types";
import { useI18n } from "@/src/i18n/provider";

export function FollowingView({
  profiles,
  requests,
}: {
  profiles: ProfileCardModel[];
  requests: { id: string; profile: ProfileCardModel }[];
}) {
  const { t } = useI18n();
  return (
    <div className="pb-8">
      <DiscoveryPageHeader title={t.followingPage.title} subtitle={t.followingPage.subtitle} />
      <div className="mt-8 px-5 md:px-0">
        <ConnectionRequests requests={requests} />
        {profiles.length ? (
          <PeopleFeed profiles={profiles} source="following" />
        ) : (
          <DiscoveryEmpty
            title={t.followingPage.emptyTitle}
            description={t.followingPage.emptyDescription}
            href={DISCOVERY_ROUTES.explore}
            cta={t.followingPage.cta}
          />
        )}
      </div>
    </div>
  );
}
