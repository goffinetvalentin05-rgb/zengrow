"use client";

import MarketingEmptySearch from "@/src/components/dashboard/marketing/empty/marketing-empty-search";
import CampaignListRow from "@/src/components/dashboard/marketing/list/campaign-list-row";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";

export default function CampaignsList() {
  const { campaigns, filteredCampaigns } = useMarketing();

  if (campaigns.length === 0) return null;

  if (filteredCampaigns.length === 0) {
    return <MarketingEmptySearch />;
  }

  return (
    <ul className="w-full min-w-0 space-y-2.5 md:space-y-3" role="list">
      {filteredCampaigns.map((campaign) => (
        <li key={campaign.id}>
          <CampaignListRow campaign={campaign} />
        </li>
      ))}
    </ul>
  );
}
