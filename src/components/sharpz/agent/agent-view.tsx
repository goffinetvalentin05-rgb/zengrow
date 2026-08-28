"use client";

import Link from "next/link";
import { Check, Database, FileSearch, Target, Users, Building2, X } from "lucide-react";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import { CopilotHero } from "@/src/components/sharpz/copilot/copilot-panel";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import { ScorePills } from "@/src/components/sharpz/score-pills";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";

function fill(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

type Props = {
  firstName: string | null;
  hasSaasProfile: boolean;
  hasVerifiedAudit: boolean;
  prospectCount: number;
  competitorCount: number;
  openActionCount: number;
  primaryObjectiveKey: string | null;
  primaryObjectiveCustomLabel: string | null;
};

export function AgentView({
  firstName,
  hasSaasProfile,
  hasVerifiedAudit,
  prospectCount,
  competitorCount,
  openActionCount,
  primaryObjectiveKey,
  primaryObjectiveCustomLabel,
}: Props) {
  const { t } = useDashboardI18n();
  const {
    proposed,
    proposedActions,
    acceptProspect,
    dismissProspect,
    acceptAction,
    dismissAction,
    acceptAllActions,
    acceptingId,
    acceptingActions,
  } = useCopilot();

  const primaryObjectiveLabel =
    primaryObjectiveCustomLabel?.trim() ||
    (primaryObjectiveKey &&
    primaryObjectiveKey in t.objectives
      ? t.objectives[primaryObjectiveKey as keyof typeof t.objectives]
      : null);

  const greeting = firstName
    ? fill(t.today.greeting, { name: firstName })
    : t.agentPage.greetingFallback;

  const suggestions = [
    {
      id: "plan",
      label: t.today.suggestionPlan,
      prompt: t.today.suggestionPlanPrompt,
    },
    {
      id: "analyse",
      label: t.today.suggestionAnalyse,
      prompt: t.today.suggestionAnalysePrompt,
    },
    {
      id: "landing",
      label: t.today.suggestionLanding,
      prompt: t.today.suggestionLandingPrompt,
    },
    {
      id: "prospects",
      label: t.today.suggestionProspects,
      prompt: t.today.suggestionProspectsPrompt,
    },
    {
      id: "traffic",
      label: t.agentPage.suggestionTraffic,
      prompt: t.agentPage.suggestionTrafficPrompt,
    },
    {
      id: "priority",
      label: t.agentPage.suggestionPriority,
      prompt: t.agentPage.suggestionPriorityPrompt,
    },
  ];

  return (
    <DashboardContent width="wide" className="space-y-14 pb-8">
      <CopilotHero
        greeting={greeting}
        question={t.agentPage.question}
        subtitle={t.agentPage.subtitle}
        suggestions={suggestions}
      />

      <section className="mx-auto w-full max-w-3xl border-t border-white/[0.06] pt-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zg-muted">
          {t.agentPage.contextTitle}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ContextItem
            icon={Database}
            label={t.agentPage.saasContext}
            value={hasSaasProfile ? t.agentPage.available : t.agentPage.missing}
            available={hasSaasProfile}
          />
          <ContextItem
            icon={FileSearch}
            label={t.agentPage.auditContext}
            value={hasVerifiedAudit ? t.agentPage.available : t.agentPage.missing}
            available={hasVerifiedAudit}
          />
          <ContextItem
            icon={Target}
            label={t.agentPage.objectiveContext}
            value={primaryObjectiveLabel ?? t.agentPage.missing}
            available={Boolean(primaryObjectiveLabel)}
          />
          <ContextItem
            icon={Users}
            label={t.agentPage.prospectContext}
            value={fill(t.agentPage.prospectCount, { count: prospectCount })}
            available={prospectCount > 0}
          />
          <ContextItem
            icon={Building2}
            label={t.agentPage.competitorContext}
            value={fill(t.agentPage.competitorCount, { count: competitorCount })}
            available={competitorCount > 0}
          />
          <ContextItem
            icon={Check}
            label={t.agentPage.openActionsContext}
            value={fill(t.agentPage.openActionCount, { count: openActionCount })}
            available={openActionCount > 0}
          />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-zg-muted">{t.agentPage.honestyNote}</p>
      </section>

      {proposedActions.length ? (
        <section className="mx-auto w-full max-w-3xl">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zg-fg">{t.agentPage.proposedActionsTitle}</h2>
              <p className="mt-1 text-sm text-zg-text-secondary">{t.agentPage.proposedActionsSubtitle}</p>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={acceptingActions}
              onClick={() => void acceptAllActions()}
            >
              {t.agentPage.addAllToToday}
            </Button>
          </div>
          <div className="space-y-3">
            {proposedActions.map((item) => (
              <article
                key={item.localId}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Badge tone="sand">{item.category}</Badge>
                    <h3 className="mt-2 text-base font-semibold text-zg-fg">{item.title}</h3>
                  </div>
                </div>
                {item.why ? (
                  <p className="mt-3 text-sm leading-relaxed text-zg-text-secondary">{item.why}</p>
                ) : null}
                <div className="mt-4">
                  <ScorePills
                    impact={item.impact}
                    effort={item.effort}
                    confidence={item.confidence}
                    score={item.score}
                    labels={{
                      impact: t.common.impact,
                      effort: t.common.effort,
                      confidence: t.common.confidence,
                      score: t.common.score,
                    }}
                  />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={acceptingId === item.localId || acceptingActions}
                    onClick={() => void acceptAction(item.localId)}
                  >
                    <Check />
                    {t.agentPage.addToToday}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => dismissAction(item.localId)}>
                    <X />
                    {t.today.ignore}
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-zg-muted">
            {t.agentPage.todayHint}{" "}
            <Link href={SHARPZ_ROUTES.today} className="text-zg-fg underline-offset-2 hover:underline">
              {t.nav.today}
            </Link>
          </p>
        </section>
      ) : null}

      {proposed.length ? (
        <section className="mx-auto w-full max-w-3xl">
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-tight text-zg-fg">{t.today.proposedTitle}</h2>
            <p className="mt-1 text-sm text-zg-text-secondary">{t.today.proposedSubtitle}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {proposed.map((item) => (
              <article key={item.localId} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-zg-fg">{item.company}</h3>
                    {item.url ? <p className="mt-1 truncate text-xs text-zg-muted">{item.url}</p> : null}
                  </div>
                  {item.fitScore != null ? <Badge>{item.fitScore}/100</Badge> : null}
                </div>
                {item.whyFit ? (
                  <p className="mt-3 text-sm leading-relaxed text-zg-text-secondary">{item.whyFit}</p>
                ) : null}
                <div className="mt-5 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={acceptingId === item.localId}
                    onClick={() => void acceptProspect(item.localId)}
                  >
                    <Check />
                    {t.today.validate}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => dismissProspect(item.localId)}>
                    <X />
                    {t.today.ignore}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </DashboardContent>
  );
}

function ContextItem({
  icon: Icon,
  label,
  value,
  available,
}: {
  icon: typeof Database;
  label: string;
  value: string;
  available: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-zg-text-secondary" strokeWidth={1.7} />
      <div className="min-w-0">
        <p className="truncate text-[13px] text-zg-fg">{label}</p>
        <p className="mt-0.5 truncate text-xs text-zg-muted">{value}</p>
      </div>
      <span
        className={`ml-auto h-1.5 w-1.5 shrink-0 rounded-full ${available ? "bg-zg-success" : "bg-zg-muted"}`}
        aria-hidden
      />
    </div>
  );
}
