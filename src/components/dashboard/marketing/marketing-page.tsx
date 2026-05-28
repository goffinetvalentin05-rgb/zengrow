"use client";

import { useState } from "react";
import { MarketingProvider } from "@/src/components/dashboard/marketing/context/marketing-provider";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import MarketingAICreateSection from "@/src/components/dashboard/marketing/ai/marketing-ai-create-section";
import MarketingAICampaignModal from "@/src/components/dashboard/marketing/ai/marketing-ai-campaign-modal";
import CampaignCreateForm from "@/src/components/dashboard/marketing/create/campaign-create-form";
import CampaignDetailModal from "@/src/components/dashboard/marketing/detail/campaign-detail-modal";
import MarketingEmptyState from "@/src/components/dashboard/marketing/empty/marketing-empty-state";
import MarketingHeader from "@/src/components/dashboard/marketing/header/marketing-header";
import MarketingKpiCards from "@/src/components/dashboard/marketing/header/marketing-kpi-cards";
import CampaignsListShell from "@/src/components/dashboard/marketing/list/campaigns-list-shell";
import MarketingQuickActions from "@/src/components/dashboard/marketing/quick-actions/marketing-quick-actions";
import MarketingToolbar from "@/src/components/dashboard/marketing/toolbar/marketing-toolbar";
import type { MarketingPageProps } from "@/src/components/dashboard/marketing/types";
import ToastInline from "@/src/components/ui/toast-inline";

function MarketingPageContent({
  restaurantId,
  canUseAI,
}: {
  restaurantId: string;
  canUseAI: boolean;
}) {
  const { showCreateForm, createMessage, campaigns, setCreateMessage } = useMarketing();
  const hasCampaigns = campaigns.length > 0;
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <section className="w-full min-w-0 space-y-6 pb-[max(1rem,env(safe-area-inset-bottom))] md:space-y-10 lg:space-y-12">
      <MarketingHeader />

      {createMessage ? (
        <ToastInline
          tone={createMessage.toLowerCase().includes("envoy") ? "success" : "info"}
          message={createMessage}
        />
      ) : null}

      {showCreateForm ? <CampaignCreateForm /> : null}

      <MarketingAICreateSection canUseAI={canUseAI} onOpen={() => setAiModalOpen(true)} />
      <MarketingAICampaignModal
        open={aiModalOpen}
        restaurantId={restaurantId}
        onClose={() => setAiModalOpen(false)}
        onSuccess={(message) => setCreateMessage(message)}
      />

      {hasCampaigns ? (
        <div className="space-y-6 md:space-y-8 lg:space-y-10">
          <MarketingKpiCards />
          <MarketingQuickActions />
          <div className="space-y-6 md:space-y-8">
            <MarketingToolbar />
            <CampaignsListShell />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <MarketingEmptyState />
        </div>
      )}

      <CampaignDetailModal />
    </section>
  );
}

export default function MarketingPage(props: MarketingPageProps) {
  return (
    <MarketingProvider {...props}>
      <MarketingPageContent restaurantId={props.restaurantId} canUseAI={props.canUseAI} />
    </MarketingProvider>
  );
}
