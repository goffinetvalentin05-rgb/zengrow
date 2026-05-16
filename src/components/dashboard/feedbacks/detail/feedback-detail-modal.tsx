"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import FeedbackDetailClientSection from "@/src/components/dashboard/feedbacks/detail/feedback-detail-client-section";
import FeedbackDetailInternalNote from "@/src/components/dashboard/feedbacks/detail/feedback-detail-internal-note";
import FeedbackDetailRatingSection from "@/src/components/dashboard/feedbacks/detail/feedback-detail-rating-section";
import FeedbackDetailReplySection from "@/src/components/dashboard/feedbacks/detail/feedback-detail-reply-section";
import FeedbackDetailSection from "@/src/components/dashboard/feedbacks/detail/feedback-detail-section";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import { buildFeedbackMetaLine } from "@/src/components/dashboard/feedbacks/utils/format-feedback-meta";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import Button, { buttonClassName } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { X } from "lucide-react";

export default function FeedbackDetailModal() {
  const {
    selectedFeedback,
    closeFeedbackDetail,
    restaurantName,
    markFeedbackRead,
    markFeedbackUnread,
    markFeedbackSavingId,
  } = useFeedbacks();
  const panelRef = useRef<HTMLDivElement>(null);
  const open = selectedFeedback != null;

  useDialogFocusTrap(open, panelRef);

  const close = useCallback(() => {
    closeFeedbackDetail();
  }, [closeFeedbackDetail]);

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

  if (!selectedFeedback) return null;

  const isUnread = selectedFeedback.read_at == null;
  const isReadSaving = markFeedbackSavingId === selectedFeedback.id;
  const metaLine = buildFeedbackMetaLine(
    selectedFeedback.created_at,
    selectedFeedback.reservation_date,
  );
  const customerHref = selectedFeedback.customer_id
    ? `/dashboard/customers?customer=${selectedFeedback.customer_id}`
    : null;

  const feedbackId = selectedFeedback.id;

  async function toggleReadStatus() {
    if (isReadSaving) return;
    if (isUnread) {
      await markFeedbackRead(feedbackId);
    } else {
      await markFeedbackUnread(feedbackId);
    }
  }

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
          aria-labelledby="feedback-detail-title"
          className={cn(
            "flex max-h-[min(92dvh,720px)] w-full max-w-[600px] flex-col overflow-hidden border-zg-border bg-zg-surface shadow-2xl",
            "rounded-t-2xl border-t sm:rounded-2xl sm:border",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-4 border-b border-zg-border px-5 py-4">
            <div className="min-w-0">
              <h2 id="feedback-detail-title" className="text-lg font-semibold text-zg-fg">
                Détail du feedback
              </h2>
              {metaLine ? <p className="mt-1 text-sm text-zg-text-muted">{metaLine}</p> : null}
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
            <FeedbackDetailClientSection feedback={selectedFeedback} />

            <FeedbackDetailRatingSection
              rating={selectedFeedback.rating}
              criteria={selectedFeedback.rating_criteria}
            />

            {selectedFeedback.message?.trim() ? (
              <FeedbackDetailSection title="Commentaire">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zg-text-secondary">
                  {selectedFeedback.message.trim()}
                </p>
              </FeedbackDetailSection>
            ) : null}

            <FeedbackDetailReplySection feedback={selectedFeedback} restaurantName={restaurantName} />

            <FeedbackDetailInternalNote feedbackId={selectedFeedback.id} />
          </div>

          <footer className="flex shrink-0 flex-col gap-2 border-t border-zg-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto"
              disabled={isReadSaving}
              onClick={() => void toggleReadStatus()}
            >
              {isUnread ? "Marquer comme lu" : "Marquer comme non lu"}
            </Button>
            {customerHref ? (
              <Link
                href={customerHref}
                className={buttonClassName({
                  variant: "ghost",
                  size: "sm",
                  className: "w-full sm:w-auto",
                })}
              >
                Voir la fiche client
              </Link>
            ) : null}
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full sm:ml-auto sm:w-auto"
              onClick={close}
            >
              Fermer
            </Button>
          </footer>
        </div>
      </div>
    </DashboardPortal>
  );
}
