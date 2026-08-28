import { analyticsHref, SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";
import type { GrowthSignal } from "@/src/lib/sharpz/follow-ups";
import type {
  AuditFinding,
  CompetitorChange,
  ContentOpportunity,
  SharpzOpportunity,
} from "@/src/lib/sharpz/types";

export type AttentionSignal = {
  id: string;
  title: string;
  detail: string;
  href: string;
};

type FollowUpProspect = {
  id: string;
  title: string;
  detail: string;
};

export function buildAttentionSignals(input: {
  changes: CompetitorChange[];
  findings: AuditFinding[];
  content: ContentOpportunity[];
  opportunities: SharpzOpportunity[];
  followUpProspects?: FollowUpProspect[];
  /** Signal growth regroupé (préféré aux N cartes individuelles). */
  followUpGrowthSignal?: GrowthSignal | null;
  extraSignals?: AttentionSignal[];
}): AttentionSignal[] {
  const signals: AttentionSignal[] = [];

  if (input.followUpGrowthSignal) {
    signals.push({
      id: input.followUpGrowthSignal.id,
      title: input.followUpGrowthSignal.title,
      detail: input.followUpGrowthSignal.detail,
      href: input.followUpGrowthSignal.href || `${SHARPZ_ROUTES.dashboard}#today-follow-ups`,
    });
  } else {
    for (const prospect of (input.followUpProspects ?? []).slice(0, 2)) {
      signals.push({
        id: `prospect-${prospect.id}`,
        title: prospect.title,
        detail: prospect.detail,
        href: SHARPZ_ROUTES.prospects,
      });
    }
  }

  for (const extra of input.extraSignals ?? []) {
    if (signals.length >= 5) break;
    signals.push(extra);
  }

  for (const change of input.changes.slice(0, 3)) {
    // Uniquement changements méritant une action (pricing / high)
    const actionable =
      change.importance === "high" ||
      change.changeType === "pricing_changed" ||
      change.changeType === "plan_added" ||
      change.changeType === "plan_removed";
    if (!actionable) continue;
    signals.push({
      id: `change-${change.id}`,
      title: change.competitorName
        ? `${change.competitorName} — ${change.whatChanged}`
        : change.whatChanged,
      detail: change.whyItMatters || change.changeType,
      href: analyticsHref("market"),
    });
  }
  for (const finding of input.findings.filter((item) => item.kind === "problem").slice(0, 2)) {
    signals.push({
      id: `finding-${finding.id}`,
      title: finding.title,
      detail: finding.detail || finding.area,
      href: analyticsHref("saas"),
    });
  }
  const content = input.content[0];
  if (content && signals.length < 5) {
    signals.push({
      id: `content-${content.id}`,
      title: content.topic,
      detail: content.whyNow || content.recommendedAngle || "",
      href: analyticsHref("content"),
    });
  }
  const opportunity = input.opportunities[0];
  if (opportunity && signals.length < 5) {
    signals.push({
      id: `opp-${opportunity.id}`,
      title: opportunity.name,
      detail: opportunity.explanation || opportunity.whyDetected || "",
      href: analyticsHref("saas"),
    });
  }
  return signals.slice(0, 5);
}
