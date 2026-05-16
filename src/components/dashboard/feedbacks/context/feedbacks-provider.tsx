"use client";

import type { ReactNode } from "react";
import { FeedbacksContext } from "@/src/components/dashboard/feedbacks/context/feedbacks-context";
import type { FeedbacksPageProps } from "@/src/components/dashboard/feedbacks/types";

type FeedbacksProviderProps = FeedbacksPageProps & {
  children: ReactNode;
};

export function FeedbacksProvider({ feedbacks, kpis, children }: FeedbacksProviderProps) {
  return <FeedbacksContext.Provider value={{ feedbacks, kpis }}>{children}</FeedbacksContext.Provider>;
}
