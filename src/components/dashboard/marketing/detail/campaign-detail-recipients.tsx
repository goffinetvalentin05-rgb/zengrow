"use client";

import { useMemo, useState } from "react";
import CampaignDetailSection from "@/src/components/dashboard/marketing/detail/campaign-detail-section";
import type { CampaignRecipientDetail } from "@/src/components/dashboard/marketing/types";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";

const PAGE_SIZE = 12;

function recipientStatus(recipient: CampaignRecipientDetail): {
  label: string;
  tone: "success" | "neutral" | "info";
} {
  if (recipient.openedAt) {
    return { label: "Ouvert", tone: "success" };
  }
  return { label: "Non ouvert", tone: "neutral" };
}

type CampaignDetailRecipientsProps = {
  recipients: readonly CampaignRecipientDetail[];
  highlighted?: boolean;
};

export default function CampaignDetailRecipients({
  recipients,
  highlighted = true,
}: CampaignDetailRecipientsProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(recipients.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const pageRows = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return recipients.slice(start, start + PAGE_SIZE);
  }, [recipients, safePage]);

  if (!highlighted) {
    return null;
  }

  return (
    <CampaignDetailSection title={`Destinataires (${recipients.length})`}>
      {recipients.length === 0 ? (
        <p className="text-sm text-zg-text-muted">Aucun destinataire enregistré.</p>
      ) : (
        <>
          <ul className="divide-y divide-zg-border overflow-hidden rounded-xl border border-zg-border">
            {pageRows.map((recipient) => {
              const status = recipientStatus(recipient);
              return (
                <li
                  key={`${recipient.email}-${recipient.sentAt}`}
                  className="flex flex-col gap-2 bg-zg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-0 truncate text-sm font-medium text-zg-fg">{recipient.email}</span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={safePage <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Précédent
              </Button>
              <p className="text-xs tabular-nums text-zg-text-muted">
                Page {safePage + 1} / {totalPages}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Suivant
              </Button>
            </div>
          ) : null}
        </>
      )}
    </CampaignDetailSection>
  );
}
