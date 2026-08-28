"use client";

import { ExternalLink } from "lucide-react";
import Badge from "@/src/components/ui/badge";
import Button, { buttonClassName } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export type CompetitorProposalCard = {
  localId: string;
  companyName: string;
  website: string;
  whyCompetitor?: string | null;
  sourceUrl?: string | null;
  confidence?: number | null;
};

type Props = {
  competitors: CompetitorProposalCard[];
  onAddOne: (localId: string) => void;
  acceptingId: string | null;
  compact?: boolean;
};

export function CompetitorSearchCards({ competitors, onAddOne, acceptingId, compact = false }: Props) {
  if (!competitors.length) return null;
  return (
    <div className={cn("space-y-3", compact ? "mt-3" : "mt-4")}>
      {competitors.map((item) => (
        <article key={item.localId} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-zg-fg">{item.companyName}</h3>
              <p className="mt-1 truncate text-xs text-zg-text-secondary">
                {item.website.replace(/^https?:\/\//, "")}
              </p>
            </div>
            {item.confidence != null ? <Badge>Confiance {item.confidence}%</Badge> : null}
          </div>
          {item.whyCompetitor ? (
            <p className="mt-3 text-sm leading-relaxed text-zg-text-secondary">{item.whyCompetitor}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName({ variant: "secondary", size: "sm" })}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Voir le site
            </a>
            <Button
              type="button"
              size="sm"
              disabled={acceptingId === item.localId}
              onClick={() => onAddOne(item.localId)}
            >
              Suivre
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
