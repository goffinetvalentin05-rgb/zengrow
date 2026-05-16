"use client";

import { useMemo, useState } from "react";
import type { CampaignRecord, MarketingBrandContext } from "@/src/components/dashboard/marketing/types";
import { buildCampaignEmailPreviewHtml } from "@/src/components/dashboard/marketing/utils/campaign-email-preview";
import Button from "@/src/components/ui/button";

type CampaignEmailPreviewProps = {
  campaign: CampaignRecord;
  brand: MarketingBrandContext;
};

export default function CampaignEmailPreview({ campaign, brand }: CampaignEmailPreviewProps) {
  const [fullscreen, setFullscreen] = useState(false);

  const html = useMemo(
    () =>
      buildCampaignEmailPreviewHtml({
        restaurantName: brand.restaurantName,
        restaurantLogoUrl: brand.restaurantLogoUrl,
        subject: campaign.subject,
        content: campaign.content,
        imageUrl: campaign.imageUrl,
        ctaUrl: brand.reservationUrl,
      }),
    [brand, campaign],
  );

  function openFullscreen() {
    const popup = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
    if (!popup) return;
    popup.document.write(html);
    popup.document.close();
    setFullscreen(true);
    popup.addEventListener("beforeunload", () => setFullscreen(false));
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-zg-border bg-[#f8fafc] shadow-zg-soft">
        <iframe
          title={`Aperçu e-mail — ${campaign.name}`}
          sandbox=""
          srcDoc={html}
          className="h-[min(420px,55vh)] w-full bg-white"
        />
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={openFullscreen}>
        {fullscreen ? "Aperçu ouvert" : "Voir en plein écran"}
      </Button>
    </div>
  );
}
