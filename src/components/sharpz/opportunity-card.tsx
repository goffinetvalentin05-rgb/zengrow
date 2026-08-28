"use client";

import Badge from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import Button from "@/src/components/ui/button";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import type { SharpzOpportunity } from "@/src/lib/sharpz/types";
import { cn } from "@/src/lib/utils";

type Props = {
  opportunity: SharpzOpportunity;
  onConvert?: (opportunity: SharpzOpportunity) => void;
  converting?: boolean;
  className?: string;
};

export function OpportunityCard({ opportunity, onConvert, converting, className }: Props) {
  const { t, locale } = useDashboardI18n();
  const categoryLabel =
    t.categories[opportunity.category as keyof typeof t.categories] ?? opportunity.category;
  const levelTone =
    opportunity.opportunityLevel === "high"
      ? "success"
      : opportunity.opportunityLevel === "low"
        ? "neutral"
        : "warning";

  return (
    <Card className={cn("flex flex-col gap-3 p-5", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{categoryLabel}</Badge>
        <Badge tone={levelTone}>{opportunity.opportunityLevel}</Badge>
        <span className="text-xs text-zg-text-muted">
          {new Date(opportunity.createdAt).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR")}
        </span>
      </div>
      <h3 className="text-base font-semibold text-zg-fg">{opportunity.name}</h3>
      {opportunity.explanation ? (
        <p className="text-sm leading-relaxed text-zg-text-secondary">{opportunity.explanation}</p>
      ) : null}
      {onConvert && !opportunity.convertedActionId ? (
        <div className="mt-auto pt-2">
          <Button type="button" size="sm" variant="secondary" disabled={converting} onClick={() => onConvert(opportunity)}>
            {t.common.convertToAction}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
