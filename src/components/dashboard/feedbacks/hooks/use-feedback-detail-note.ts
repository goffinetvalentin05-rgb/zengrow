"use client";

import { useEffect, useRef } from "react";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";

const DEBOUNCE_MS = 1000;

export function useFeedbackDetailNote(feedbackId: string | null) {
  const { noteDrafts, saveFeedbackNote } = useFeedbacks();
  const note = feedbackId ? (noteDrafts[feedbackId] ?? "") : "";
  const skipNextSave = useRef(true);
  const feedbackIdRef = useRef(feedbackId);

  useEffect(() => {
    if (feedbackIdRef.current !== feedbackId) {
      feedbackIdRef.current = feedbackId;
      skipNextSave.current = true;
    }
  }, [feedbackId]);

  useEffect(() => {
    if (!feedbackId) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void saveFeedbackNote(feedbackId);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [note, feedbackId, saveFeedbackNote]);

  return note;
}
