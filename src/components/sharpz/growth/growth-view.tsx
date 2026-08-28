"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Tabs from "@/src/components/ui/tabs";
import Badge from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import Button from "@/src/components/ui/button";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { GROWTH_CATEGORIES } from "@/src/lib/sharpz/constants";
import type { SharpzOpportunity } from "@/src/lib/sharpz/types";

type Props = {
  opportunities: SharpzOpportunity[];
};

export function GrowthView({ opportunities }: Props) {
  const { t } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [tab, setTab] = useState("all");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (tab === "all") return opportunities.filter((item) => GROWTH_CATEGORIES.includes(item.category as typeof GROWTH_CATEGORIES[number]) || !item.category.startsWith("market"));
    return opportunities.filter((item) => item.category === tab);
  }, [opportunities, tab]);

  async function convert(id: string) {
    setPendingId(id);
    const response = await fetch(`/api/sharpz/opportunities/${id}/convert`, { method: "POST" });
    setPendingId(null);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    showToast({ message: t.common.saved });
    router.refresh();
  }

  return (
    <DashboardContent>
      <PageHeader title={t.growthPage.title} subtitle={t.growthPage.subtitle}>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "all", label: t.common.all },
            ...GROWTH_CATEGORIES.map((id) => ({ id, label: t.categories[id] })),
          ]}
        />
      </PageHeader>

      {filtered.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3 p-5">
              <div className="flex flex-wrap gap-2">
                <Badge tone="accent">{t.categories[item.category as keyof typeof t.categories] ?? item.category}</Badge>
                <Badge tone="premium">{t.common.potential} {item.potential ?? "—"}/10</Badge>
                <Badge tone="neutral">{t.common.effort} {item.effort ?? "—"}/10</Badge>
                <Badge tone="info">{t.common.confidence} {item.confidence ?? "—"}%</Badge>
              </div>
              <h3 className="text-base font-semibold text-zg-fg">{item.name}</h3>
              {item.explanation ? <p className="text-sm leading-relaxed text-zg-text-secondary">{item.explanation}</p> : null}
              {item.whyDetected ? (
                <p className="text-sm text-zg-text-muted">
                  <span className="font-medium text-zg-fg">{t.growthPage.whyDetected}: </span>
                  {item.whyDetected}
                </p>
              ) : null}
              {item.dataUsed ? (
                <p className="text-sm text-zg-text-muted">
                  <span className="font-medium text-zg-fg">{t.growthPage.dataUsed}: </span>
                  {item.dataUsed}
                </p>
              ) : null}
              {!item.convertedActionId ? (
                <div className="mt-auto pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    disabled={pendingId === item.id}
                    onClick={() => convert(item.id)}
                  >
                    {t.common.convertToAction}
                  </Button>
                </div>
              ) : (
                <p className="text-xs font-medium text-zg-success">{t.common.seeAction}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <SharpzEmptyPanel title={t.empty.noOpportunitiesTitle} description={t.empty.noOpportunitiesDescription} icon={TrendingUp} />
      )}
    </DashboardContent>
  );
}
