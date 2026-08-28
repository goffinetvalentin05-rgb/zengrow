"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Tabs from "@/src/components/ui/tabs";
import { AnalyseView } from "@/src/components/sharpz/analyse/analyse-view";
import { BarChart3 } from "lucide-react";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import type {
  AuditFinding,
  AuditRecord,
  SharpzAction,
} from "@/src/lib/sharpz/types";

type Tab = "analyse" | "traffic";

type Props = {
  tab: Tab;
  lastAudit: AuditRecord | null;
  findings: AuditFinding[];
  recommendedActions: SharpzAction[];
};

export function IntelligenceView({
  tab,
  lastAudit,
  findings,
  recommendedActions,
}: Props) {
  const { t } = useDashboardI18n();
  const router = useRouter();

  return (
    <DashboardContent width="wide">
      <PageHeader title={t.intelligencePage.title} subtitle={t.intelligencePage.subtitle}>
        <Tabs
          value={tab}
          onChange={(value) => router.replace(`/dashboard/intelligence?tab=${value}`)}
          tabs={[
            { id: "analyse", label: t.intelligencePage.tabAnalyse },
            { id: "traffic", label: t.intelligencePage.tabTraffic },
          ]}
        />
      </PageHeader>

      {tab === "analyse" ? (
        <AnalyseView
          embedded
          lastAudit={lastAudit}
          findings={findings}
          recommendedActions={recommendedActions}
        />
      ) : null}
      {tab === "traffic" ? <TrafficNotConnected /> : null}
    </DashboardContent>
  );
}

function TrafficNotConnected() {
  const { t } = useDashboardI18n();
  return (
    <section className="flex min-h-[420px] items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
      <div className="max-w-md">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04]">
          <BarChart3 className="h-5 w-5 text-zg-text-secondary" strokeWidth={1.6} />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-zg-fg">
          {t.intelligencePage.trafficNotConnected}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zg-text-secondary">
          {t.intelligencePage.trafficNotConnectedDescription}
        </p>
      </div>
    </section>
  );
}
