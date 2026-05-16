"use client";

import { MarketingProvider } from "@/src/components/dashboard/marketing/context/marketing-provider";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import CampaignCreateForm from "@/src/components/dashboard/marketing/create/campaign-create-form";
import MarketingHeader from "@/src/components/dashboard/marketing/header/marketing-header";
import MarketingKpiCards from "@/src/components/dashboard/marketing/header/marketing-kpi-cards";
import CampaignsListShell from "@/src/components/dashboard/marketing/list/campaigns-list-shell";
import MarketingQuickActions from "@/src/components/dashboard/marketing/quick-actions/marketing-quick-actions";
import MarketingToolbar from "@/src/components/dashboard/marketing/toolbar/marketing-toolbar";
import type { MarketingPageProps } from "@/src/components/dashboard/marketing/types";
import ToastInline from "@/src/components/ui/toast-inline";

function MarketingPageContent() {
  const { showCreateForm, createMessage, campaigns } = useMarketing();
  const hasCampaigns = campaigns.length > 0;

  return (
    <section className="w-full min-w-0 space-y-8 md:space-y-12">
      <MarketingHeader />
      <MarketingKpiCards />
      <MarketingQuickActions />

      {createMessage ? (
        <ToastInline
          tone={createMessage.toLowerCase().includes("envoy") ? "success" : "info"}
          message={createMessage}
        />
      ) : null}

      {showCreateForm ? <CampaignCreateForm /> : null}

      {hasCampaigns ? (
        <div className="space-y-6 md:space-y-8">
          <MarketingToolbar />
          <CampaignsListShell />
        </div>
      ) : null}
    </section>
  );
}

export default function MarketingPage(props: MarketingPageProps) {
  return (
    <MarketingProvider {...props}>
      <MarketingPageContent />
    </MarketingProvider>
  );
}
