"use client";

import { createContext, type Dispatch, type SetStateAction } from "react";
import type { FeedbackRecord } from "@/src/components/dashboard/feedbacks/types";
import type {
  FeedbackFilterPill,
  FeedbackFilterPillKey,
  FeedbackFilters,
} from "@/src/components/dashboard/feedbacks/utils/feedback-filters";
import type { FeedbackKpis } from "@/src/components/dashboard/feedbacks/utils/feedback-kpis";

export type FeedbacksContextValue = {
  feedbacks: FeedbackRecord[];
  filteredFeedbacks: FeedbackRecord[];
  kpis: FeedbackKpis;
  filters: FeedbackFilters;
  setFilters: Dispatch<SetStateAction<FeedbackFilters>>;
  filterPills: FeedbackFilterPill[];
  clearFilter: (key: FeedbackFilterPillKey) => void;
  resetFilters: () => void;
  activeFilterCount: number;
};

export const FeedbacksContext = createContext<FeedbacksContextValue | null>(null);
