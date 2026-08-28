"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks } from "lucide-react";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import FilterBar from "@/src/components/dashboard/ui/filter-bar";
import Tabs from "@/src/components/ui/tabs";
import Select from "@/src/components/ui/select";
import Button from "@/src/components/ui/button";
import { ActionCard } from "@/src/components/sharpz/action-card";
import { SharpzDetailDrawer } from "@/src/components/sharpz/detail-drawer";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { ScorePills } from "@/src/components/sharpz/score-pills";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { ACTION_CATEGORIES } from "@/src/lib/sharpz/constants";
import type { ActionStatus, SharpzAction } from "@/src/lib/sharpz/types";

type Period = "today" | "week" | "all";

type Props = {
  actions: SharpzAction[];
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfWeek() {
  const date = startOfToday();
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diff);
  return date;
}

export function ActionsBoard({ actions }: Props) {
  const { t, locale } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [period, setPeriod] = useState<Period>("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<SharpzAction | null>(null);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    return actions.filter((action) => {
      if (category !== "all" && action.category !== category) return false;
      if (status !== "all" && action.status !== status) return false;
      const detected = new Date(action.detectedAt);
      if (period === "today" && detected < startOfToday()) return false;
      if (period === "week" && detected < startOfWeek()) return false;
      return true;
    });
  }, [actions, category, status, period]);

  async function updateStatus(id: string, next: ActionStatus) {
    setPending(true);
    const response = await fetch(`/api/sharpz/actions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setPending(false);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    showToast({ message: t.common.saved });
    setSelected((current) => (current ? { ...current, status: next } : current));
    router.refresh();
  }

  async function createExperiment(action: SharpzAction) {
    setPending(true);
    const response = await fetch("/api/sharpz/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hypothesis: action.why || action.title,
        actionId: action.id,
        actionDescription: action.title,
      }),
    });
    setPending(false);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    showToast({ message: t.common.saved });
    router.push("/dashboard/progress");
  }

  return (
    <DashboardContent>
      <PageHeader title={t.actionsPage.title} subtitle={t.actionsPage.subtitle}>
        <FilterBar>
          <Tabs
            value={period}
            onChange={(value) => setPeriod(value as Period)}
            tabs={[
              { id: "today", label: t.common.today },
              { id: "week", label: t.common.thisWeek },
              { id: "all", label: t.common.all },
            ]}
          />
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">{t.common.category}</option>
            {ACTION_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {t.categories[item]}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">{t.common.status}</option>
            {(["todo", "in_progress", "done", "ignored"] as const).map((item) => (
              <option key={item} value={item}>
                {t.statuses[item]}
              </option>
            ))}
          </Select>
        </FilterBar>
      </PageHeader>

      {filtered.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((action) => (
            <ActionCard key={action.id} action={action} onOpen={setSelected} />
          ))}
        </div>
      ) : (
        <SharpzEmptyPanel title={t.empty.noActionsTitle} description={t.empty.noActionsDescription} icon={ListChecks} />
      )}

      <SharpzDetailDrawer open={Boolean(selected)} title={selected?.title ?? ""} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-5">
            <ScorePills
              impact={selected.impact}
              effort={selected.effort}
              confidence={selected.confidence}
              score={selected.score}
              labels={{
                impact: t.common.impact,
                effort: t.common.effort,
                confidence: t.common.confidence,
                score: t.common.score,
              }}
            />
            <p className="text-sm text-zg-text-muted">
              {t.actionsPage.detectedAt}:{" "}
              {new Date(selected.detectedAt).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR")}
            </p>
            {selected.why ? (
              <section>
                <h3 className="text-sm font-semibold text-zg-fg">{t.actionsPage.why}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zg-text-secondary">{selected.why}</p>
              </section>
            ) : null}
            {selected.howTo ? (
              <section>
                <h3 className="text-sm font-semibold text-zg-fg">{t.actionsPage.how}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zg-text-secondary">{selected.howTo}</p>
              </section>
            ) : null}
            {selected.microSteps.length ? (
              <section>
                <h3 className="text-sm font-semibold text-zg-fg">{t.actionsPage.steps}</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zg-text-secondary">
                  {selected.microSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(["todo", "in_progress", "done", "ignored"] as const).map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={selected.status === item ? "primary" : "secondary"}
                  disabled={pending}
                  onClick={() => updateStatus(selected.id, item)}
                >
                  {item === "todo"
                    ? t.actionsPage.markTodo
                    : item === "in_progress"
                      ? t.actionsPage.markProgress
                      : item === "done"
                        ? t.actionsPage.markDone
                        : t.actionsPage.markIgnored}
                </Button>
              ))}
              <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => createExperiment(selected)}>
                {t.actionsPage.createExperiment}
              </Button>
            </div>
          </div>
        ) : null}
      </SharpzDetailDrawer>
    </DashboardContent>
  );
}
