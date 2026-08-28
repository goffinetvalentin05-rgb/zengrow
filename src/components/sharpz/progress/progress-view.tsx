"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FlaskConical, Loader, Ban } from "lucide-react";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Tabs from "@/src/components/ui/tabs";
import StatCard from "@/src/components/ui/stat-card";
import { Card } from "@/src/components/ui/card";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import type { Experiment, SharpzAction } from "@/src/lib/sharpz/types";

type Period = "week" | "month";

type Props = {
  actions: SharpzAction[];
  experiments: Experiment[];
  hasConnectedData: boolean;
};

function inPeriod(dateIso: string, period: Period) {
  const date = new Date(dateIso);
  const now = new Date();
  const start = new Date(now);
  if (period === "week") start.setDate(now.getDate() - 7);
  else start.setDate(now.getDate() - 30);
  return date >= start;
}

export function ProgressView({ actions, experiments, hasConnectedData }: Props) {
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

  const completedWithResult = experiments.filter((item) => item.status === "completed" && item.result);

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
    <DashboardContent>
      <PageHeader title={t.progressPage.title} subtitle={t.progressPage.subtitle}>
        <Tabs
          value={period}
          onChange={(value) => setPeriod(value as Period)}
          tabs={[
            { id: "week", label: t.common.thisWeek },
            { id: "month", label: t.common.thisMonth },
          ]}
        />
      </PageHeader>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zg-fg">{t.progressPage.results}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={`${counts.done} ${t.progressPage.done}`} value={counts.done} icon={CheckCircle2} dataTone="success" />
          <StatCard
            label={`${counts.inProgress} ${t.progressPage.inProgress}`}
            value={counts.inProgress}
            icon={Loader}
            dataTone="accent"
          />
          <StatCard label={`${counts.ignored} ${t.progressPage.ignored}`} value={counts.ignored} icon={Ban} dataTone="warning" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zg-fg">{t.progressPage.impact}</h2>
        {hasConnectedData && completedWithResult.length ? (
          <div className="grid gap-4">
            {completedWithResult.map((item) => (
              <Card key={item.id} className="p-5">
                <p className="text-sm font-semibold text-zg-fg">{item.actionDescription || item.hypothesis}</p>
                <p className="mt-2 text-sm text-zg-text-secondary">
                  {t.progressPage.correlated}: {item.result}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <SharpzEmptyPanel
            title={t.empty.noProgressTitle}
            description={hasConnectedData ? t.empty.noExperimentsDescription : t.empty.noIntegrationsDescription}
            icon={FlaskConical}
          />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zg-fg">{t.progressPage.experiments}</h2>
        <Card className="p-5">
          <form className="space-y-3" onSubmit={createExperiment}>
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
              rows={3}
            />
            <Button type="submit" size="sm" disabled={pending}>
              {t.progressPage.addExperiment}
            </Button>
          </form>
        </Card>
        {experiments.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {experiments.map((item) => (
              <Card key={item.id} className="space-y-3 p-5">
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
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zg-text-muted">{t.empty.noExperimentsDescription}</p>
        )}
      </section>
    </DashboardContent>
  );
}
