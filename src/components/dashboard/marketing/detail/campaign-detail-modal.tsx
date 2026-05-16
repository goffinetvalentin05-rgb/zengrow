"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CampaignDetailContent from "@/src/components/dashboard/marketing/detail/campaign-detail-content";
import CampaignDetailRecipients from "@/src/components/dashboard/marketing/detail/campaign-detail-recipients";
import CampaignDetailStatsPanel from "@/src/components/dashboard/marketing/detail/campaign-detail-stats-panel";
import CampaignEmailPreview from "@/src/components/dashboard/marketing/detail/campaign-email-preview";
import CampaignDetailSection from "@/src/components/dashboard/marketing/detail/campaign-detail-section";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import { campaignStatusBadge } from "@/src/components/dashboard/marketing/utils/campaign-status-badge";
import { computeCampaignDetailStats } from "@/src/components/dashboard/marketing/utils/campaign-detail-stats";
import { downloadCampaignRecipientsCsv } from "@/src/components/dashboard/marketing/utils/campaign-recipients-csv";
import { formatCampaignDisplayDate } from "@/src/components/dashboard/marketing/utils/format-campaign-meta";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { Copy, Download, X } from "lucide-react";

export default function CampaignDetailModal() {
  const {
    selectedCampaignId,
    selectedCampaign,
    recipientsByCampaignId,
    brand,
    closeCampaignDetail,
    duplicateCampaign,
  } = useMarketing();

  const panelRef = useRef<HTMLDivElement>(null);
  const [showRecipientsOnly, setShowRecipientsOnly] = useState(false);
  const open = selectedCampaign != null;

  useDialogFocusTrap(open, panelRef);

  const recipients = useMemo(() => {
    if (!selectedCampaignId) return [];
    return recipientsByCampaignId[selectedCampaignId] ?? [];
  }, [recipientsByCampaignId, selectedCampaignId]);

  const stats = useMemo(() => computeCampaignDetailStats(recipients), [recipients]);

  const close = useCallback(() => {
    setShowRecipientsOnly(false);
    closeCampaignDetail();
  }, [closeCampaignDetail]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) setShowRecipientsOnly(false);
  }, [open, selectedCampaignId]);

  if (!selectedCampaign) return null;

  const status = campaignStatusBadge(selectedCampaign.status);
  const dateLabel = formatCampaignDisplayDate(selectedCampaign.sentAt ?? selectedCampaign.createdAt);

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
        role="presentation"
        onClick={close}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="campaign-detail-title"
          className={cn(
            "flex max-h-[min(92dvh,900px)] w-full max-w-[800px] flex-col overflow-hidden border-zg-border bg-zg-surface shadow-2xl",
            "rounded-t-2xl border-t sm:rounded-2xl sm:border",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-4 border-b border-zg-border px-5 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="campaign-detail-title" className="min-w-0 truncate text-lg font-semibold text-zg-fg">
                  {selectedCampaign.name}
                </h2>
                <Badge tone={status.tone} className="uppercase tracking-wide">
                  {status.label}
                </Badge>
              </div>
              <p className="mt-1 text-sm italic text-zg-text-muted">{selectedCampaign.subject}</p>
              <p className="mt-1 text-xs text-zg-text-muted">{dateLabel}</p>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-2 text-zg-text-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/25"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <div className="flex-1 space-y-8 overflow-y-auto px-5 py-5">
            {showRecipientsOnly ? (
              <CampaignDetailRecipients recipients={recipients} />
            ) : (
              <>
                <CampaignDetailSection title="Aperçu">
                  <CampaignEmailPreview campaign={selectedCampaign} brand={brand} />
                </CampaignDetailSection>

                <CampaignDetailStatsPanel stats={stats} />
                <CampaignDetailRecipients recipients={recipients} />
                <CampaignDetailContent campaign={selectedCampaign} />
              </>
            )}
          </div>

          <footer className="flex flex-col gap-2 border-t border-zg-border px-5 py-4 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                duplicateCampaign(selectedCampaign);
                close();
              }}
            >
              <Copy className="h-4 w-4" strokeWidth={2} aria-hidden />
              Dupliquer cette campagne
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowRecipientsOnly((v) => !v)}
            >
              {showRecipientsOnly ? "Vue complète" : "Voir les destinataires"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={recipients.length === 0}
              onClick={() => downloadCampaignRecipientsCsv(selectedCampaign, recipients)}
            >
              <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
              Télécharger le rapport CSV
            </Button>
          </footer>
        </div>
      </div>
    </DashboardPortal>
  );
}
