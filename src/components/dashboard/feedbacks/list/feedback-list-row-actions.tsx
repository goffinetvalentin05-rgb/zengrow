"use client";

import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import type { FeedbackRecord } from "@/src/components/dashboard/feedbacks/types";
import { buildFeedbackReplyMailto } from "@/src/components/dashboard/feedbacks/utils/feedback-mailto";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { Mail, MailOpen } from "lucide-react";

type FeedbackListRowActionsProps = {
  feedback: FeedbackRecord;
  className?: string;
};

export default function FeedbackListRowActions({ feedback, className }: FeedbackListRowActionsProps) {
  const { restaurantName, markFeedbackRead, markFeedbackSavingId } = useFeedbacks();
  const isUnread = feedback.read_at == null;
  const isSaving = markFeedbackSavingId === feedback.id;
  const hasEmail = Boolean(feedback.customer_email?.trim());

  function handleReply(event: React.MouseEvent) {
    event.stopPropagation();
    const href = buildFeedbackReplyMailto(feedback.customer_email ?? "", restaurantName);
    if (href) window.location.href = href;
  }

  async function handleMarkRead(event: React.MouseEvent) {
    event.stopPropagation();
    if (!isUnread || isSaving) return;
    await markFeedbackRead(feedback.id);
  }

  return (
    <div
      className={cn(
        "flex w-full shrink-0 flex-wrap items-center justify-end gap-1 sm:w-auto sm:gap-2",
        "opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-150 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {isUnread ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs"
          disabled={isSaving}
          onClick={handleMarkRead}
        >
          <MailOpen className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Marquer lu
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2.5 text-xs"
        disabled={!hasEmail}
        onClick={handleReply}
      >
        <Mail className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Répondre
      </Button>
    </div>
  );
}
