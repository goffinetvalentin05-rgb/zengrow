"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import Badge from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import type { ResultImpactRow } from "@/src/lib/sharpz/results";
import type { ActionImpactAttribution } from "@/src/lib/sharpz/types";

type Props = {
  impacts: ResultImpactRow[];
};

function formatDelta(delta: number | null, percent: number | null) {
  if (delta == null) return "—";
  const sign = delta > 0 ? "+" : "";
  const pct = percent != null ? ` (${sign}${percent}%)` : "";
  return `${sign}${delta}${pct}`;
}

function DeltaIcon({ delta }: { delta: number | null }) {
  if (delta == null || delta === 0) return <Minus className="h-4 w-4 text-zg-muted" />;
  if (delta > 0) return <ArrowUpRight className="h-4 w-4 text-emerald-400" />;
  return <ArrowDownRight className="h-4 w-4 text-amber-400" />;
}

export function ResultsImpactList({ impacts }: Props) {
  const { t } = useDashboardI18n();

  const attributionLabel = (value: ActionImpactAttribution | string) => {
    if (value === "experiment") return t.progressPage.attributionExperiment;
    if (value === "correlated") return t.progressPage.attributionCorrelated;
    return t.progressPage.attributionObserved;
  };

  const metricLabel = (metric: string) => {
    if (metric === "visitors") return t.progressPage.metricVisitors;
    return metric;
  };

  return (
    <div className="grid gap-4">
      {impacts.map((item) => (
        <Card key={item.id} className="space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zg-fg">{item.actionTitle}</p>
              <p className="mt-1 text-xs text-zg-muted">{metricLabel(item.metric)}</p>
            </div>
            <Badge tone="neutral">{attributionLabel(item.attributionType)}</Badge>
          </div>

          {item.beforeValue != null || item.afterValue != null ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-zg-muted">{t.progressPage.before}</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-zg-fg">{item.beforeValue ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-zg-muted">{t.progressPage.after}</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-zg-fg">{item.afterValue ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-zg-muted">{t.progressPage.delta}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-lg font-semibold tabular-nums text-zg-fg">
                  <DeltaIcon delta={item.deltaAbsolute} />
                  {formatDelta(item.deltaAbsolute, item.deltaPercent)}
                </p>
              </div>
            </div>
          ) : null}

          {item.observedFrom && item.observedTo ? (
            <p className="text-xs text-zg-muted">
              {t.progressPage.observedWindow}:{" "}
              {new Date(item.observedFrom).toLocaleDateString()} → {new Date(item.observedTo).toLocaleDateString()}
            </p>
          ) : null}

          {item.confidence != null ? (
            <p className="text-xs text-zg-muted">
              {t.progressPage.confidence}: {item.confidence}%
            </p>
          ) : null}

          {item.evidence ? (
            <p className="text-sm leading-relaxed text-zg-text-secondary">{item.evidence}</p>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
