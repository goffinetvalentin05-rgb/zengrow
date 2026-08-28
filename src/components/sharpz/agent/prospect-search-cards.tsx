"use client";

import { ExternalLink } from "lucide-react";
import Badge from "@/src/components/ui/badge";
import Button, { buttonClassName } from "@/src/components/ui/button";
import type { CopilotProspect } from "@/src/components/sharpz/copilot/copilot-context";
import { cn } from "@/src/lib/utils";

type Copy = {
  fit: string;
  email: string;
  phone: string;
  location: string;
  noContact: string;
  viewSite: string;
  add: string;
  whyFit: string;
};

type Props = {
  prospects: CopilotProspect[];
  selectedIds: Set<string>;
  onToggle: (localId: string) => void;
  onAddOne: (localId: string) => void;
  acceptingId: string | null;
  copy: Copy;
  compact?: boolean;
};

export function ProspectSearchCards({
  prospects,
  selectedIds,
  onToggle,
  onAddOne,
  acceptingId,
  copy,
  compact = false,
}: Props) {
  return (
    <div className={cn("space-y-3", compact ? "mt-3" : "mt-4")}>
      {prospects.map((item) => {
        const hasContact = Boolean(item.email || item.phone);
        return (
          <article
            key={item.localId}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedIds.has(item.localId)}
                onChange={() => onToggle(item.localId)}
                className="mt-1 h-4 w-4 shrink-0 accent-white"
                aria-label={item.company}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-zg-fg">{item.company}</h3>
                    {item.location ? (
                      <p className="mt-0.5 text-[12px] text-zg-muted">{item.location}</p>
                    ) : null}
                    {item.url ? (
                      <p className="mt-1 truncate text-xs text-zg-text-secondary">{item.url.replace(/^https?:\/\//, "")}</p>
                    ) : null}
                  </div>
                  {item.fitScore != null ? (
                    <Badge>{copy.fit} {item.fitScore}%</Badge>
                  ) : null}
                </div>

                <div className="mt-3 space-y-1.5 text-sm">
                  {item.email ? (
                    <p className="text-zg-text-secondary">
                      <span className="text-zg-muted">{copy.email} · </span>
                      {item.email}
                    </p>
                  ) : null}
                  {item.phone ? (
                    <p className="text-zg-text-secondary">
                      <span className="text-zg-muted">{copy.phone} · </span>
                      {item.phone}
                    </p>
                  ) : null}
                  {!hasContact ? (
                    <p className="text-[12px] text-zg-muted">{copy.noContact}</p>
                  ) : null}
                </div>

                {item.whyFit ? (
                  <p className="mt-3 text-sm leading-relaxed text-zg-text-secondary">
                    <span className="text-zg-muted">{copy.whyFit} </span>
                    {item.whyFit}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClassName({ variant: "secondary", size: "sm" })}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {copy.viewSite}
                    </a>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    disabled={acceptingId === item.localId}
                    onClick={() => onAddOne(item.localId)}
                  >
                    {copy.add}
                  </Button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
