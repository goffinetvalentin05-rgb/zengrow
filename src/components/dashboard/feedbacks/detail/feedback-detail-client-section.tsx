"use client";

import Link from "next/link";
import FeedbackDetailSection from "@/src/components/dashboard/feedbacks/detail/feedback-detail-section";
import type { FeedbackRecord } from "@/src/components/dashboard/feedbacks/types";
import {
  displayCustomerName,
  formatVisitDateLabel,
} from "@/src/components/dashboard/feedbacks/utils/format-feedback-meta";
import ReservationsGuestAvatar from "@/src/components/dashboard/reservations/list-row/reservations-guest-avatar";

type FeedbackDetailClientSectionProps = {
  feedback: FeedbackRecord;
};

export default function FeedbackDetailClientSection({ feedback }: FeedbackDetailClientSectionProps) {
  const customerName = displayCustomerName(feedback.customer_name);
  const visitLabel = formatVisitDateLabel(feedback.reservation_date);
  const customerHref = feedback.customer_id
    ? `/dashboard/customers?customer=${feedback.customer_id}`
    : null;

  return (
    <FeedbackDetailSection title="Client">
      <div className="flex items-center gap-3">
        <ReservationsGuestAvatar name={customerName} size="lg" variant="solid" />
        <div className="min-w-0">
          {customerHref ? (
            <Link
              href={customerHref}
              className="text-base font-semibold text-zg-fg underline-offset-2 hover:text-zg-accent hover:underline"
            >
              {customerName}
            </Link>
          ) : (
            <p className="text-base font-semibold text-zg-fg">{customerName}</p>
          )}
          {feedback.customer_email ? (
            <p className="mt-0.5 truncate text-sm text-zg-text-muted">{feedback.customer_email}</p>
          ) : null}
          {visitLabel ? (
            <p className="mt-1 text-sm text-zg-text-muted">
              Visite du {visitLabel}
              {feedback.reservation_id ? (
                <>
                  {" "}
                  ·{" "}
                  <Link
                    href="/dashboard/reservations"
                    className="font-medium text-zg-accent underline-offset-2 hover:underline"
                  >
                    Voir les réservations
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
          {feedback.guests != null ? (
            <p className="mt-0.5 text-sm text-zg-text-muted">
              {feedback.guests} couvert{feedback.guests > 1 ? "s" : ""}
            </p>
          ) : null}
        </div>
      </div>
    </FeedbackDetailSection>
  );
}
