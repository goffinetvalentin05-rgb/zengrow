"use client";

import { memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import CampaignListRowActions from "@/src/components/dashboard/marketing/list/campaign-list-row-actions";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import type { CampaignRecord } from "@/src/components/dashboard/marketing/types";
import { campaignStatusBadge } from "@/src/components/dashboard/marketing/utils/campaign-status-badge";
import { buildCampaignStatsLine } from "@/src/components/dashboard/marketing/utils/format-campaign-meta";
import Badge from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { ChevronRight, Mail } from "lucide-react";

type CampaignListRowProps = {
  campaign: CampaignRecord;
};

function CampaignListRow({ campaign }: CampaignListRowProps) {
  const router = useRouter();
  const { openCampaignDetail } = useMarketing();
  const status = campaignStatusBadge(campaign.status);

  const statsLine = useMemo(
    () =>
      buildCampaignStatsLine({
        sentAt: campaign.sentAt,
        createdAt: campaign.createdAt,
        recipientsCount: campaign.recipientsCount,
        openedCount: campaign.openedCount,
      }),
    [campaign.sentAt, campaign.createdAt, campaign.recipientsCount, campaign.openedCount],
  );

  const onOpen = useCallback(() => {
    openCampaignDetail(campaign.id);
    router.push(`/dashboard/marketing/${campaign.id}`);
  }, [campaign.id, openCampaignDetail, router]);

  return (
    <article
      className={cn(
        "group relative rounded-xl border border-zg-border bg-zg-surface transition-colors duration-150",
        "hover:border-zg-border-hover hover:bg-zg-card-hover",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-xl px-4 py-3.5 text-left sm:px-5 sm:py-4"
        aria-label={`Ouvrir la campagne ${campaign.name}`}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zg-accent-soft-bg text-zg-accent"
            aria-hidden
          >
            <Mail className="h-5 w-5" strokeWidth={1.85} />
          </div>

          <div className="min-w-0 flex-1 pr-6 sm:pr-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <h3 className="min-w-0 truncate text-base font-semibold leading-snug text-zg-fg">
                {campaign.name}
              </h3>
              <Badge tone={status.tone} className="w-fit shrink-0 uppercase tracking-wide">
                {status.label}
              </Badge>
            </div>

            <p className="mt-1 line-clamp-1 text-sm italic text-zg-text-muted">{campaign.subject}</p>
            <p className="mt-2 text-sm tabular-nums text-zg-text-secondary">{statsLine}</p>
          </div>

          <ChevronRight
            className="absolute right-4 top-4 hidden h-5 w-5 shrink-0 text-zg-text-muted transition-colors group-hover:text-zg-fg sm:block"
            strokeWidth={2}
            aria-hidden
          />
        </div>
      </button>

      <div className="border-t border-zg-border/70 px-4 py-2 sm:px-5">
        <CampaignListRowActions campaign={campaign} />
      </div>
    </article>
  );
}

export default memo(CampaignListRow);
