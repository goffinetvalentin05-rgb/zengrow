"use client";

import { useEffect, useState } from "react";
import FeedbackDetailSection from "@/src/components/dashboard/feedbacks/detail/feedback-detail-section";
import type { FeedbackRecord } from "@/src/components/dashboard/feedbacks/types";
import { buildFeedbackReplyMailto } from "@/src/components/dashboard/feedbacks/utils/feedback-mailto";
import { suggestedReplyForRating } from "@/src/components/dashboard/feedbacks/utils/feedback-reply-suggestions";
import Button from "@/src/components/ui/button";
import Textarea from "@/src/components/ui/textarea";
import { Mail } from "lucide-react";

type FeedbackDetailReplySectionProps = {
  feedback: FeedbackRecord;
  restaurantName: string;
};

export default function FeedbackDetailReplySection({
  feedback,
  restaurantName,
}: FeedbackDetailReplySectionProps) {
  const hasEmail = Boolean(feedback.customer_email?.trim());
  const [draft, setDraft] = useState(() => suggestedReplyForRating(feedback.rating, restaurantName));

  useEffect(() => {
    setDraft(suggestedReplyForRating(feedback.rating, restaurantName));
  }, [feedback.id, feedback.rating, restaurantName]);

  function handleSendViaEmail() {
    const href = buildFeedbackReplyMailto(feedback.customer_email ?? "", restaurantName, draft);
    if (href) window.location.href = href;
  }

  function applySuggestion() {
    setDraft(suggestedReplyForRating(feedback.rating, restaurantName));
  }

  return (
    <FeedbackDetailSection title="Réponse">
      <p className="text-sm text-zg-text-muted">
        Rédigez votre message puis ouvrez votre client mail. L&apos;envoi automatique depuis ZenGrow
        (noreply@zengrow.com) arrive bientôt.
      </p>

      <div className="rounded-xl border border-dashed border-zg-border bg-zg-surface-soft/50 px-4 py-3">
        <p className="text-xs font-medium text-zg-text-muted">Historique des échanges</p>
        <p className="mt-1 text-sm text-zg-text-muted">Aucune réponse enregistrée pour le moment.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={applySuggestion}
          className="rounded-full border border-zg-border bg-zg-surface-elevated px-3 py-1 text-xs font-medium text-zg-fg transition-colors hover:bg-zg-card-hover"
        >
          Suggestion selon la note
        </button>
      </div>

      <Textarea
        className="min-h-36"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Votre message au client…"
        disabled={!hasEmail}
        aria-label="Message de réponse au client"
      />

      <Button
        type="button"
        variant="primary"
        size="md"
        className="w-full sm:w-auto"
        disabled={!hasEmail || !draft.trim()}
        onClick={handleSendViaEmail}
      >
        <Mail className="h-4 w-4" strokeWidth={2} aria-hidden />
        Répondre par email
      </Button>

      {!hasEmail ? (
        <p className="text-xs text-zg-warning">Aucune adresse e-mail client disponible.</p>
      ) : null}
    </FeedbackDetailSection>
  );
}
