"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, MessageSquareQuote, Percent } from "lucide-react";
import PageHeader from "@/src/components/dashboard/page-header";
import ReservationsKpiCard from "@/src/components/dashboard/reservations/header/reservations-kpi-card";
import Tabs from "@/src/components/ui/tabs";
import AIUsageCounter from "@/src/components/dashboard/ai/ai-usage-counter";
import GoogleReviewTab from "@/src/components/dashboard/ai/google-review-tab";
import { useAIUsage } from "@/src/components/dashboard/ai/use-ai-usage";
import ReputationFeedbacksTab from "@/src/components/dashboard/reputation/reputation-feedbacks-tab";
import ReputationReviewRequestsTab from "@/src/components/dashboard/reputation/reputation-review-requests-tab";
import type { FeedbacksPageProps } from "@/src/components/dashboard/feedbacks/types";

export type ReputationPageProps = FeedbacksPageProps & {
  reviewAutomation: {
    is_enabled: boolean;
    delay_minutes: number;
    google_review_url: string;
    email_subject: string;
    email_message: string;
    button_positive_label: string;
    button_neutral_label: string;
    button_negative_label: string;
    primary_color: string;
  };
  canUseAI: boolean;
};

const TAB_ITEMS = [
  { id: "review-requests", label: "Demandes d'avis" },
  { id: "private-feedback", label: "Retours privés" },
  { id: "google-replies", label: "Réponses Google" },
] as const;

type TabId = (typeof TAB_ITEMS)[number]["id"];

function parseTab(value: string | null): TabId {
  if (value === "private-feedback" || value === "google-replies" || value === "review-requests") {
    return value;
  }
  return "review-requests";
}

export default function ReputationPage({
  restaurantId,
  restaurantName,
  reviewAutomation,
  canUseAI,
  ...feedbacksProps
}: ReputationPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = useMemo(() => parseTab(searchParams.get("tab")), [searchParams]);
  const { usage, loading, refresh } = useAIUsage(canUseAI ? restaurantId : "");

  function setTab(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`/dashboard/reputation?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avis Google"
        subtitle="Transformez les utilisations de bons en avis clients."
      />

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        aria-labelledby="reviews-kpi-heading"
      >
        <h2 id="reviews-kpi-heading" className="sr-only">
          Indicateurs avis
        </h2>
        <ReservationsKpiCard
          label="Avis demandés"
          value={14}
          subline="Après utilisation d’un bon"
          icon={MailCheck}
          dataTone="accent"
        />
        <ReservationsKpiCard
          label="Avis reçus"
          value={6}
          subline="Sur Google"
          icon={MessageSquareQuote}
          dataTone="premium"
        />
        <ReservationsKpiCard
          label="Taux de conversion"
          value="43 %"
          subline="Demandes → avis"
          icon={Percent}
          dataTone="success"
        />
      </div>

      {canUseAI ? (
        <AIUsageCounter
          used={usage?.used ?? 0}
          limit={usage?.limit ?? 0}
          loading={loading}
          canAccess={usage?.canAccess ?? true}
          isFounder={usage?.isFounder ?? false}
        />
      ) : (
        <p className="rounded-xl border border-zg-border bg-zg-surface-elevated px-4 py-3 text-sm text-zg-text-muted">
          Les outils IA sont inclus dans le plan Pro (69 CHF/mois). Votre plan Starter inclut les demandes
          d&apos;avis et les retours privés sans génération IA.
        </p>
      )}

      <Tabs tabs={[...TAB_ITEMS]} value={tab} onChange={setTab} />

      {tab === "review-requests" ? (
        <ReputationReviewRequestsTab
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          reviewAutomation={reviewAutomation}
          canUseAI={canUseAI}
        />
      ) : null}

      {tab === "private-feedback" ? (
        <ReputationFeedbacksTab
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          canUseAI={canUseAI}
          {...feedbacksProps}
        />
      ) : null}

      {tab === "google-replies" ? (
        canUseAI ? (
          <GoogleReviewTab restaurantId={restaurantId} usage={usage} onUsageRefresh={() => void refresh()} />
        ) : (
          <p className="rounded-xl border border-zg-border bg-zg-surface-elevated px-4 py-3 text-sm text-zg-text-muted">
            Les réponses Google assistées par IA sont disponibles avec le plan Pro.
          </p>
        )
      ) : null}
    </div>
  );
}
