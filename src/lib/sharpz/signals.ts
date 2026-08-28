import { analyticsHref } from "@/src/lib/sharpz/routes";
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

export function buildAttentionSignals(input: {
  changes: CompetitorChange[];
  findings: AuditFinding[];
  content: ContentOpportunity[];
  opportunities: SharpzOpportunity[];
}): AttentionSignal[] {
  const signals: AttentionSignal[] = [];
  for (const change of input.changes.slice(0, 2)) {
    signals.push({
      id: `change-${change.id}`,
      title: change.whatChanged,
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
