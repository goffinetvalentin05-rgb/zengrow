"use client";

import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
import { DiscoveryPageHeader } from "@/src/components/discovery/sz-ui";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import type { ProfileCardModel } from "@/src/lib/discovery/types";
import { useI18n } from "@/src/i18n/provider";

export function SavedView({ profiles }: { profiles: ProfileCardModel[] }) {
  const { t } = useI18n();
  return (
    <div className="pb-8">
      <DiscoveryPageHeader title={t.savedPage.title} subtitle={t.savedPage.subtitle} />
      <div className="mt-8 px-5 md:px-0">
        {profiles.length ? (
          <PeopleFeed profiles={profiles} source="saved" />
        ) : (
          <DiscoveryEmpty
            title={t.savedPage.emptyTitle}
            description={t.savedPage.emptyDescription}
            href={DISCOVERY_ROUTES.explore}
            cta={t.savedPage.cta}
          />
        )}
      </div>
    </div>
  );
}
