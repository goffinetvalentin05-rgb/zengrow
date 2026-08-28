"use client";

import { Check, X } from "lucide-react";
import { useLayoutEffect } from "react";
import { useSetDashboardTitle } from "@/src/components/dashboard/dashboard-title-context";
import { ProspectSearchCards } from "@/src/components/sharpz/agent/prospect-search-cards";
import { CopilotHero } from "@/src/components/sharpz/copilot/copilot-panel";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import { ScorePills } from "@/src/components/sharpz/score-pills";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import Link from "next/link";

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
  const setDashboardTitle = useSetDashboardTitle();
  const {
    proposed,
    proposedActions,
    selectedProspectIds,
    toggleProspectSelection,
    acceptProspect,
    acceptSelectedProspects,
    acceptAllProspects,
    dismissProspect,
    acceptAction,
    dismissAction,
    acceptAllActions,
    acceptingId,
    acceptingActions,
    acceptingProspects,
  } = useCopilot();

  useLayoutEffect(() => {
    if (!setDashboardTitle) return;
    setDashboardTitle({ title: t.nav.agent, subtitle: t.agentPage.subtitle });
    return () => setDashboardTitle(null);
  }, [setDashboardTitle, t.nav.agent, t.agentPage.subtitle]);

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

  const cardCopy = {
    fit: t.agentPage.fitLabel,
    email: t.prospectsPage.email,
    phone: t.prospectsPage.phone,
    location: t.agentPage.locationLabel,
    noContact: t.agentPage.contactNotFound,
    viewSite: t.agentPage.viewSite,
    add: t.today.validate,
    whyFit: t.prospectsPage.whyFit + " :",
  };

  return (
    <div className="mx-auto w-full max-w-3xl pb-14">
      <CopilotHero
        greeting={greeting}
        firstName={firstName}
        question={t.agentPage.question}
        subtitle={t.agentPage.subtitle}
        suggestions={suggestions}
      />

      <p className="mx-auto mt-12 max-w-xl text-center text-[11px] leading-relaxed text-zg-muted/80">
        {[
          hasSaasProfile ? t.agentPage.saasContext : null,
          hasVerifiedAudit ? t.agentPage.auditContext : null,
          primaryObjectiveLabel,
          prospectCount > 0 ? fill(t.agentPage.prospectCount, { count: prospectCount }) : null,
          competitorCount > 0 ? fill(t.agentPage.competitorCount, { count: competitorCount }) : null,
          openActionCount > 0 ? fill(t.agentPage.openActionCount, { count: openActionCount }) : null,
        ]
          .filter(Boolean)
          .join("  ·  ") || t.agentPage.honestyNote}
      </p>

      {proposedActions.length ? (
        <section className="zg-surface-panel mt-12 overflow-hidden p-6 text-left">
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
          <div className="divide-y divide-white/[0.06]">
            {proposedActions.map((item) => (
              <article key={item.localId} className="py-5 first:pt-0 last:pb-0">
                <Badge tone="sand">{item.category}</Badge>
                <h3 className="mt-2 text-base font-semibold text-zg-fg">{item.title}</h3>
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
            <Link href={SHARPZ_ROUTES.dashboard} className="text-zg-fg underline-offset-2 hover:underline">
              {t.nav.dashboard}
            </Link>
          </p>
        </section>
      ) : null}

      {proposed.length ? (
        <section className="zg-surface-panel mt-6 overflow-hidden p-6 text-left">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zg-fg">{t.today.proposedTitle}</h2>
              <p className="mt-1 text-sm text-zg-text-secondary">{t.today.proposedSubtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={acceptingProspects || selectedProspectIds.size === 0}
                onClick={() => void acceptSelectedProspects()}
              >
                {t.agentPage.addSelectedProspects}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={acceptingProspects}
                onClick={() => void acceptAllProspects()}
              >
                {fill(t.agentPage.addAllProspects, { count: proposed.length })}
              </Button>
            </div>
          </div>

          <ProspectSearchCards
            prospects={proposed}
            selectedIds={selectedProspectIds}
            onToggle={toggleProspectSelection}
            onAddOne={(id) => void acceptProspect(id)}
            acceptingId={acceptingId}
            copy={cardCopy}
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {proposed.map((item) => (
              <Button key={item.localId} type="button" size="sm" variant="ghost" onClick={() => dismissProspect(item.localId)}>
                <X />
                {t.today.ignore} · {item.company}
              </Button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
