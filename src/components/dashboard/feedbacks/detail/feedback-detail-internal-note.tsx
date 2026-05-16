"use client";

import FeedbackDetailSection from "@/src/components/dashboard/feedbacks/detail/feedback-detail-section";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import { useFeedbackDetailNote } from "@/src/components/dashboard/feedbacks/hooks/use-feedback-detail-note";
import Textarea from "@/src/components/ui/textarea";

type FeedbackDetailInternalNoteProps = {
  feedbackId: string;
};

export default function FeedbackDetailInternalNote({ feedbackId }: FeedbackDetailInternalNoteProps) {
  const { noteDrafts, setNoteDrafts, noteSavingId } = useFeedbacks();
  useFeedbackDetailNote(feedbackId);
  const isSaving = noteSavingId === feedbackId;

  return (
    <FeedbackDetailSection title="Notes internes">
      <Textarea
        className="min-h-28"
        value={noteDrafts[feedbackId] ?? ""}
        onChange={(e) =>
          setNoteDrafts((current) => ({
            ...current,
            [feedbackId]: e.target.value,
          }))
        }
        placeholder="Note interne pour l'équipe (non visible du client)"
        disabled={isSaving}
        aria-label="Note interne sur ce feedback"
      />
      <p className="text-xs text-zg-text-muted">
        {isSaving ? "Enregistrement…" : "Enregistrement automatique après 1 s"}
      </p>
    </FeedbackDetailSection>
  );
}
