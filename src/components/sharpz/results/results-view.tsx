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
import { EXPERIMENT_METRICS } from "@/src/lib/sharpz/experiments";
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

function statusTone(status: string): "success" | "warning" | "neutral" | "danger" {
  if (status === "completed") return "success";
  if (status === "running") return "warning";
  if (status === "cancelled") return "danger";
  return "neutral";
}

export function ResultsView({
  actions,
  experiments,
  impacts,
  prospects,
  hasConnectedData,
  trafficHasData,
}: Props) {
  const { t, locale } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [period, setPeriod] = useState<Period>("week");
  const [title, setTitle] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [metric, setMetric] = useState<string>("visitors_7d");
  const [plannedDays, setPlannedDays] = useState(14);
  const [pending, setPending] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";

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
      body: JSON.stringify({
        title: title.trim() || undefined,
        hypothesis,
        actionDescription,
        metric: metric || null,
        plannedDays,
        startNow: true,
      }),
    });
    setPending(false);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    const data = (await response.json()) as { beforeAvailable?: boolean };
    setTitle("");
    setHypothesis("");
    setActionDescription("");
    showToast({
      message: data.beforeAvailable
        ? t.progressPage.experimentStartedWithBaseline
        : t.progressPage.experimentStartedNoBaseline,
    });
    router.refresh();
  }

  async function patchExperiment(id: string, action: "start" | "complete" | "cancel") {
    setBusyId(id);
    const response = await fetch(`/api/sharpz/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusyId(null);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    showToast({
      message:
        action === "complete"
          ? t.progressPage.experimentCompleted
          : action === "cancel"
            ? t.progressPage.experimentCancelled
            : t.progressPage.experimentStartedWithBaseline,
    });
    router.refresh();
  }

  function metricLabel(key: string | null) {
    if (!key) return t.progressPage.metricUnavailable;
    return t.progressPage.metrics[key as keyof typeof t.progressPage.metrics] ?? key;
  }

  function statusLabel(status: string) {
    if (status === "completed") return t.progressPage.completed;
    if (status === "running") return t.progressPage.running;
    if (status === "draft") return t.progressPage.draft;
    if (status === "cancelled") return t.progressPage.cancelled;
    return status;
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
                      {item.title || item.actionDescription || item.hypothesis}
                    </p>
                    <p className="mt-2 text-sm text-zg-text-secondary">
                      {t.progressPage.correlated}: {item.result}
                    </p>
                    {item.conclusion ? (
                      <p className="mt-2 text-sm text-zg-muted">{item.conclusion}</p>
                    ) : null}
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
        <p className="mt-1.5 max-w-2xl text-sm text-zg-muted">{t.progressPage.experimentsSubtitle}</p>

        <form className="mt-5 grid gap-3" onSubmit={createExperiment}>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t.progressPage.experimentTitle}
            />
            <select
              value={metric}
              onChange={(event) => setMetric(event.target.value)}
              className="min-h-10 rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-zg-fg outline-none"
              aria-label={t.progressPage.metric}
            >
              {EXPERIMENT_METRICS.map((key) => (
                <option key={key} value={key} className="bg-zinc-950 text-white">
                  {metricLabel(key)}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            value={hypothesis}
            onChange={(event) => setHypothesis(event.target.value)}
            placeholder={t.progressPage.hypothesis}
            rows={2}
            required
          />
          <div className="grid gap-3 md:grid-cols-[1fr_140px_auto] md:items-start">
            <Input
              value={actionDescription}
              onChange={(event) => setActionDescription(event.target.value)}
              placeholder={t.progressPage.action}
            />
            <Input
              type="number"
              min={1}
              max={90}
              value={plannedDays}
              onChange={(event) => setPlannedDays(Number(event.target.value) || 14)}
              aria-label={t.progressPage.plannedDays}
            />
            <Button type="submit" size="sm" disabled={pending}>
              {t.progressPage.addExperiment}
            </Button>
          </div>
        </form>

        {experiments.length ? (
          <div className="mt-6 divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {experiments.map((item) => (
              <article key={item.id} className="space-y-3 py-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                  {item.metric ? <Badge tone="neutral">{metricLabel(item.metric)}</Badge> : null}
                </div>
                <h3 className="text-base font-semibold tracking-tight text-zg-fg">
                  {item.title || item.hypothesis}
                </h3>
                <p className="text-sm text-zg-text-secondary">
                  <span className="font-medium text-zg-fg">{t.progressPage.hypothesis}: </span>
                  {item.hypothesis}
                </p>
                {item.actionDescription ? (
                  <p className="text-sm text-zg-text-secondary">
                    <span className="font-medium text-zg-fg">{t.progressPage.action}: </span>
                    {item.actionDescription}
                  </p>
                ) : null}
                <p className="text-xs text-zg-muted">
                  {t.progressPage.period}: {new Date(item.startedAt).toLocaleDateString(dateLocale)}
                  {item.plannedEndAt
                    ? ` → ${new Date(item.plannedEndAt).toLocaleDateString(dateLocale)}`
                    : ""}
                  {item.completedAt
                    ? ` · ${t.progressPage.ended}: ${new Date(item.completedAt).toLocaleDateString(dateLocale)}`
                    : ""}
                </p>
                <div className="grid gap-2 text-sm text-zg-text-secondary sm:grid-cols-3">
                  <p>
                    <span className="text-zg-muted">{t.progressPage.before}: </span>
                    {item.beforeValue != null ? item.beforeValue : t.progressPage.baselineUnavailable}
                  </p>
                  <p>
                    <span className="text-zg-muted">{t.progressPage.after}: </span>
                    {item.afterValue != null ? item.afterValue : "—"}
                  </p>
                  <p>
                    <span className="text-zg-muted">{t.progressPage.observedDelta}: </span>
                    {item.deltaPercent != null
                      ? `${item.deltaPercent > 0 ? "+" : ""}${item.deltaPercent} %`
                      : item.deltaAbsolute != null
                        ? String(item.deltaAbsolute)
                        : "—"}
                  </p>
                </div>
                {item.result ? (
                  <p className="text-sm text-zg-text-secondary">
                    <span className="font-medium text-zg-fg">{t.progressPage.result}: </span>
                    {item.result}
                  </p>
                ) : null}
                {item.conclusion ? (
                  <p className="text-sm leading-relaxed text-zg-muted">
                    <span className="font-medium text-zg-fg">{t.progressPage.conclusion}: </span>
                    {item.conclusion}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  {item.status === "draft" ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => void patchExperiment(item.id, "start")}
                    >
                      {t.progressPage.startExperiment}
                    </Button>
                  ) : null}
                  {item.status === "running" ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => void patchExperiment(item.id, "complete")}
                    >
                      {t.progressPage.completeExperiment}
                    </Button>
                  ) : null}
                  {item.status === "draft" || item.status === "running" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busyId === item.id}
                      onClick={() => void patchExperiment(item.id, "cancel")}
                    >
                      {t.progressPage.cancelExperiment}
                    </Button>
                  ) : null}
                </div>
              </article>
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
