"use client";

import { createContext } from "react";
import type { FeedbackRecord } from "@/src/components/dashboard/feedbacks/types";
import type { FeedbackKpis } from "@/src/components/dashboard/feedbacks/utils/feedback-kpis";

export type FeedbacksContextValue = {
  feedbacks: FeedbackRecord[];
  kpis: FeedbackKpis;
};

export const FeedbacksContext = createContext<FeedbacksContextValue | null>(null);
