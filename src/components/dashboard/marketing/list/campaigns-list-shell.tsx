"use client";

import CampaignsList from "@/src/components/dashboard/marketing/list/campaigns-list";

export default function CampaignsListShell() {
  return (
    <section aria-labelledby="marketing-campaigns-list-heading" className="w-full min-w-0 space-y-4">
      <h2 id="marketing-campaigns-list-heading" className="text-base font-semibold text-zg-fg">
        Campagnes
      </h2>
      <CampaignsList />
    </section>
  );
}
