"use client";

import Link from "next/link";
import { memo, useCallback, useMemo } from "react";
import FeedbackListRowActions from "@/src/components/dashboard/feedbacks/list/feedback-list-row-actions";
import FeedbackUnreadBadge from "@/src/components/dashboard/feedbacks/list/feedback-unread-badge";
import FeedbackStars from "@/src/components/dashboard/feedbacks/ui/feedback-stars";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import type { FeedbackRecord } from "@/src/components/dashboard/feedbacks/types";
import {
  buildFeedbackMetaLine,
  displayCustomerName,
} from "@/src/components/dashboard/feedbacks/utils/format-feedback-meta";
import {
  feedbackRowBorderClass,
  feedbackRowHoverClass,
} from "@/src/components/dashboard/feedbacks/utils/feedback-rating-styles";
import ReservationsGuestAvatar from "@/src/components/dashboard/reservations/list-row/reservations-guest-avatar";
import { cn } from "@/src/lib/utils";
import { ChevronRight } from "lucide-react";

type FeedbackListRowProps = {
  feedback: FeedbackRecord;
};

function FeedbackCommentPreview({ message }: { message: string | null }) {
  const text = message?.trim();
  if (!text) return null;
  return (
    <p className="mt-2 line-clamp-2 text-sm italic leading-relaxed text-zg-text-secondary">
      <span className="text-zg-text-muted" aria-hidden>
        &ldquo;
      </span>
      {text}
      <span className="text-zg-text-muted" aria-hidden>
        &rdquo;
      </span>
    </p>
  );
}

function FeedbackListRow({ feedback }: FeedbackListRowProps) {
  const { openFeedbackDetail } = useFeedbacks();
  const customerName = displayCustomerName(feedback.customer_name);
  const isUnread = feedback.read_at == null;
  const metaLine = useMemo(
    () => buildFeedbackMetaLine(feedback.created_at, feedback.reservation_date),
    [feedback.created_at, feedback.reservation_date],
  );

  const onOpenDetail = useCallback(() => {
    openFeedbackDetail(feedback.id);
  }, [feedback.id, openFeedbackDetail]);

  const customerHref = feedback.customer_id
    ? `/dashboard/customers?customer=${feedback.customer_id}`
    : null;

  return (
    <article
      className={cn(
        "group relative rounded-xl border bg-zg-surface transition-colors duration-150",
        feedbackRowBorderClass(feedback.rating),
        feedbackRowHoverClass(feedback.rating),
      )}
    >
      <div className="px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <ReservationsGuestAvatar name={customerName} size="md" variant="solid" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
              {customerHref ? (
                <Link
                  href={customerHref}
                  className="min-w-0 flex-1 truncate text-base font-semibold leading-snug text-zg-fg underline-offset-2 hover:text-zg-accent hover:underline"
                >
                  {customerName}
                </Link>
              ) : (
                <span className="min-w-0 flex-1 truncate text-base font-semibold leading-snug text-zg-fg">
                  {customerName}
                </span>
              )}
              <span className="flex shrink-0 items-center gap-2">
                <FeedbackStars value={feedback.rating} size="sm" />
                {isUnread ? <FeedbackUnreadBadge /> : null}
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenDetail}
              className="mt-1 w-full pr-8 text-left sm:pr-10"
              aria-label={`Ouvrir le feedback de ${customerName}`}
            >
              {metaLine ? (
                <span className="block text-sm text-zg-text-muted">{metaLine}</span>
              ) : null}
              <FeedbackCommentPreview message={feedback.message} />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenDetail}
            tabIndex={-1}
            aria-hidden
            className="hidden shrink-0 rounded-lg p-1 text-zg-text-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg sm:mt-1 sm:block"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-2 flex justify-end sm:mt-3">
          <FeedbackListRowActions feedback={feedback} />
        </div>
      </div>
    </article>
  );
}

export default memo(FeedbackListRow);
