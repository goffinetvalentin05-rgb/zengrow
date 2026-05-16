"use client";

import { useRouter } from "next/navigation";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import type { CampaignRecord } from "@/src/components/dashboard/marketing/types";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { Copy, Eye, Trash2 } from "lucide-react";

type CampaignListRowActionsProps = {
  campaign: CampaignRecord;
  className?: string;
};

export default function CampaignListRowActions({ campaign, className }: CampaignListRowActionsProps) {
  const router = useRouter();
  const { duplicateCampaign, deleteCampaign, deletingCampaignId } = useMarketing();
  const isDeleting = deletingCampaignId === campaign.id;
  const isDraft = campaign.status === "draft";

  function handleViewDetails(event: React.MouseEvent) {
    event.stopPropagation();
    router.push(`/dashboard/marketing/${campaign.id}`);
  }

  function handleDuplicate(event: React.MouseEvent) {
    event.stopPropagation();
    duplicateCampaign(campaign);
  }

  async function handleDelete(event: React.MouseEvent) {
    event.stopPropagation();
    if (!isDraft || isDeleting) return;
    await deleteCampaign(campaign.id);
  }

  return (
    <div
      className={cn(
        "flex w-full shrink-0 flex-wrap items-center justify-end gap-1 sm:w-auto sm:gap-2",
        "opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-150 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2.5 text-xs" onClick={handleDuplicate}>
        <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Dupliquer
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2.5 text-xs" onClick={handleViewDetails}>
        <Eye className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Voir détails
      </Button>
      {isDraft ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs text-zg-danger hover:text-zg-danger"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Supprimer
        </Button>
      ) : null}
    </div>
  );
}
