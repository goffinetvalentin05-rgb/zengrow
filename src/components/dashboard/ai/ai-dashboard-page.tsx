"use client";

import { useState } from "react";
import PageHeader from "@/src/components/dashboard/page-header";
import Tabs from "@/src/components/ui/tabs";
import AIUsageCounter from "@/src/components/dashboard/ai/ai-usage-counter";
import GoogleReviewTab from "@/src/components/dashboard/ai/google-review-tab";
import CampaignTab from "@/src/components/dashboard/ai/campaign-tab";
import { useAIUsage } from "@/src/components/dashboard/ai/use-ai-usage";

type AIDashboardPageProps = {
  restaurantId: string;
  restaurantName: string;
};

const TAB_ITEMS = [
  { id: "google", label: "Réponses Google" },
  { id: "campaigns", label: "Campagnes IA" },
];

export default function AIDashboardPage({ restaurantId, restaurantName }: AIDashboardPageProps) {
  const [tab, setTab] = useState("google");
  const { usage, loading, refresh } = useAIUsage(restaurantId);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="IA & Réputation"
        title="Assistant IA"
        subtitle={`Outils IA pour ${restaurantName} — réponses Google, campagnes marketing et plus.`}
      />

      <AIUsageCounter
        used={usage?.used ?? 0}
        limit={usage?.limit ?? 0}
        loading={loading}
      />

      <Tabs tabs={TAB_ITEMS} value={tab} onChange={setTab} />

      {tab === "google" ? (
        <GoogleReviewTab restaurantId={restaurantId} usage={usage} onUsageRefresh={() => void refresh()} />
      ) : null}
      {tab === "campaigns" ? (
        <CampaignTab restaurantId={restaurantId} usage={usage} onUsageRefresh={() => void refresh()} />
      ) : null}
    </div>
  );
}
