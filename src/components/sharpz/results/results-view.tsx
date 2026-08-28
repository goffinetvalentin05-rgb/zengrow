"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Tabs from "@/src/components/ui/tabs";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import { ResultsImpactList } from "@/src/components/sharpz/results/results-impact-list";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import type { ResultImpactRow } from "@/src/lib/sharpz/results";
import { computeProspectStats } from "@/src/lib/sharpz/results";
import type { Experiment, Prospect, SharpzAction } from "@/src/lib/sharpz/types";
import { cn } from "@/src/lib/utils";

type Period = "week" | "month";

type Props = {
  actions: SharpzAction[];
  experiments: Experiment[];
  impacts: ResultImpactRow[];
  prospects: Prospect[];
  hasConnectedData: boolean;
  trafficHasData: boolean;
};

function inPeriod(dateIso: string, period: Period) {
  const date = new Date(dateIso);
  const now = new Date();
  const start = new Date(now);
  if (period === "week") start.setDate(now.getDate() - 7);
  else start.setDate(now.getDate() - 30);
  return date >= start;
}

export function ResultsView({
  actions,
  experiments,
  impacts,
  prospects,
  hasConnectedData,
  trafficHasData,
}: Props) {
  const { t } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [period, setPeriod] = useState<Period>("week");
  const [hypothesis, setHypothesis] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [pending, setPending] = useState(false);

  const counts = useMemo(() => {
    const scoped = actions.filter((action) => inPeriod(action.detectedAt, period) || action.status !== "todo");
    return {
      done: scoped.filter((action) => action.status === "done" && inPeriod(action.detectedAt, period)).length,
      inProgress: scoped.filter((action) => action.status === "in_progress").length,
      ignored: scoped.filter((action) => action.status === "ignored" && inPeriod(action.detectedAt, period)).length,
    };
  }, [actions, period]);

  const prospectStats = useMemo(() => computeProspectStats(prospects, period), [prospects, period]);

  const completedWithResult = experiments.filter((item) => item.status === "completed" && item.result);
  const hasImpactSection = impacts.length > 0 || completedWithResult.length > 0;

  async function createExperiment(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/sharpz/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hypothesis, actionDescription }),
    });
    setPending(false);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    setHypothesis("");
    setActionDescription("");
    showToast({ message: t.common.saved });
    router.refresh();
  }

  return (
    <DashboardContent width="wide" className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-zg-fg">{t.progressPage.title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zg-text-secondary">{t.progressPage.subtitle}</p>
        </div>
        <Tabs
          value={period}
          onChange={(value) => setPeriod(value as Period)}
          tabs={[
            { id: "week", label: t.common.thisWeek },
            { id: "month", label: t.common.thisMonth },
          ]}
        />
      </header>

      <section className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="zg-surface-panel relative overflow-hidden p-7">
          <div
            className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(155,122,173,0.22), transparent 68%)" }}
            aria-hidden
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zg-muted">
            {t.progressPage.results}
          </p>
          <p className="zg-stat-value mt-6 text-6xl leading-none tracking-tight text-zg-fg tabular-nums">
            {counts.done}
          </p>
          <p className="mt-3 text-sm text-zg-text-secondary">{t.progressPage.done}</p>
        </div>

        <div className="zg-surface-panel grid grid-cols-2 content-stretch divide-x divide-y divide-white/[0.06] overflow-hidden p-0">
          <MetricCell label={t.progressPage.inProgress} value={counts.inProgress} />
          <MetricCell label={t.progressPage.ignored} value={counts.ignored} />
          <MetricCell
            label={period === "week" ? t.progressPage.prospectsCustomers : t.progressPage.prospectsCustomersMonth}
            value={prospectStats.customers}
          />
          <MetricCell
            label={period === "week" ? t.progressPage.prospectsQualified : t.progressPage.prospectsQualifiedMonth}
            value={prospectStats.qualified}
          />
        </div>
      </section>

      <section className="zg-surface-panel p-7">
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight text-zg-fg">{t.progressPage.impact}</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zg-muted">
            {t.progressPage.correlationDisclaimer}
          </p>
        </div>

        {hasImpactSection ? (
          <div className="space-y-6">
            {impacts.length ? <ResultsImpactList impacts={impacts} /> : null}
            {completedWithResult.length ? (
              <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
                {completedWithResult.map((item) => (
                  <div key={item.id} className="py-5 first:pt-5">
                    <Badge tone="neutral">{t.progressPage.attributionExperiment}</Badge>
                    <p className="mt-3 text-sm font-semibold text-zg-fg">
                      {item.actionDescription || item.hypothesis}
                    </p>
                    <p className="mt-2 text-sm text-zg-text-secondary">
                      {t.progressPage.correlated}: {item.result}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <FlaskConical className="h-6 w-6 text-zg-muted" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium text-zg-fg">{t.empty.noProgressTitle}</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zg-muted">
              {hasConnectedData || trafficHasData
                ? t.progressPage.noImpactsYet
                : t.empty.noIntegrationsDescription}
            </p>
          </div>
        )}
      </section>

      <section className="zg-surface-panel p-7">
        <h2 className="text-lg font-semibold tracking-tight text-zg-fg">{t.progressPage.experiments}</h2>
        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-start" onSubmit={createExperiment}>
          <Input
            value={hypothesis}
            onChange={(event) => setHypothesis(event.target.value)}
            placeholder={t.progressPage.hypothesis}
            required
          />
          <Textarea
            value={actionDescription}
            onChange={(event) => setActionDescription(event.target.value)}
            placeholder={t.progressPage.action}
            rows={1}
            className="min-h-10 md:min-h-10"
          />
          <Button type="submit" size="sm" className="md:mt-0.5" disabled={pending}>
            {t.progressPage.addExperiment}
          </Button>
        </form>

        {experiments.length ? (
          <div className="mt-6 divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {experiments.map((item) => (
              <div key={item.id} className="space-y-2 py-5">
                <Badge tone={item.status === "completed" ? "success" : "warning"}>
                  {item.status === "completed" ? t.progressPage.completed : t.progressPage.running}
                </Badge>
                <p className="text-sm">
                  <span className="font-medium text-zg-fg">{t.progressPage.hypothesis}: </span>
                  <span className="text-zg-text-secondary">{item.hypothesis}</span>
                </p>
                {item.actionDescription ? (
                  <p className="text-sm">
                    <span className="font-medium text-zg-fg">{t.progressPage.action}: </span>
                    <span className="text-zg-text-secondary">{item.actionDescription}</span>
                  </p>
                ) : null}
                {item.result ? (
                  <p className="text-sm">
                    <span className="font-medium text-zg-fg">{t.progressPage.result}: </span>
                    <span className="text-zg-text-secondary">{item.result}</span>
                  </p>
                ) : null}
                {item.conclusion ? (
                  <p className="text-sm">
                    <span className="font-medium text-zg-fg">{t.progressPage.conclusion}: </span>
                    <span className="text-zg-text-secondary">{item.conclusion}</span>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-zg-muted">{t.empty.noExperimentsDescription}</p>
        )}
      </section>
    </DashboardContent>
  );
}

function MetricCell({ label, value }: { label: string; value: number }) {
  return (
    <div className={cn("flex min-h-[120px] flex-col justify-between p-5")}>
      <p className="text-xs text-zg-muted">{label}</p>
      <p className="zg-stat-value text-3xl tabular-nums tracking-tight text-zg-fg">{value}</p>
    </div>
  );
}

/** @deprecated Utiliser ResultsView */
export const ProgressView = ResultsView;
