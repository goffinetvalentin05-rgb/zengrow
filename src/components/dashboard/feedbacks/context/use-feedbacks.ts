"use client";

import { useContext } from "react";
import { FeedbacksContext } from "@/src/components/dashboard/feedbacks/context/feedbacks-context";

export function useFeedbacks() {
  const ctx = useContext(FeedbacksContext);
  if (!ctx) {
    throw new Error("useFeedbacks must be used within FeedbacksProvider");
  }
  return ctx;
}
