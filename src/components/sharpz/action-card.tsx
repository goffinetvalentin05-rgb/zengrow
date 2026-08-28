"use client";

import Link from "next/link";
import Badge from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import { buttonClassName } from "@/src/components/ui/button";
import { ScorePills } from "@/src/components/sharpz/score-pills";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import type { SharpzAction } from "@/src/lib/sharpz/types";
import { cn } from "@/src/lib/utils";

type Props = {
  action: SharpzAction;
  onOpen?: (action: SharpzAction) => void;
  className?: string;
};

export function ActionCard({ action, onOpen, className }: Props) {
  const { t } = useDashboardI18n();
  const categoryLabel =
    t.categories[action.category as keyof typeof t.categories] ?? action.category;
  const statusLabel = t.statuses[action.status as keyof typeof t.statuses] ?? action.status;

  return (
    <Card className={cn("flex flex-col gap-4 p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{categoryLabel}</Badge>
            <Badge
              tone={
                action.status === "done"
                  ? "success"
                  : action.status === "ignored"
                    ? "neutral"
                    : action.status === "in_progress"
                      ? "warning"
                      : "info"
              }
            >
              {statusLabel}
            </Badge>
          </div>
          <h3 className="mt-3 text-base font-semibold text-zg-fg">{action.title}</h3>
        </div>
        {onOpen ? (
          <button
            type="button"
            className={buttonClassName({ variant: "secondary", size: "sm", className: "shrink-0" })}
            onClick={() => onOpen(action)}
          >
            {t.common.seeAction}
          </button>
        ) : (
          <Link
            href="/dashboard"
            className={buttonClassName({ variant: "secondary", size: "sm", className: "shrink-0" })}
          >
            {t.common.seeAction}
          </Link>
        )}
      </div>
      <ScorePills
        impact={action.impact}
        effort={action.effort}
        confidence={action.confidence}
        score={action.score}
        labels={{
          impact: t.common.impact,
          effort: t.common.effort,
          confidence: t.common.confidence,
          score: t.common.score,
        }}
      />
    </Card>
  );
}
