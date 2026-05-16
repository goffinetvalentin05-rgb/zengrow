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
  restaurantName: string;
  filters: FeedbackFilters;
  setFilters: Dispatch<SetStateAction<FeedbackFilters>>;
  filterPills: FeedbackFilterPill[];
  clearFilter: (key: FeedbackFilterPillKey) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  selectedFeedbackId: string | null;
  selectedFeedback: FeedbackRecord | null;
  openFeedbackDetail: (feedbackId: string) => void;
  closeFeedbackDetail: () => void;
  markFeedbackRead: (feedbackId: string) => Promise<void>;
  markFeedbackUnread: (feedbackId: string) => Promise<void>;
  markFeedbackSavingId: string | null;
  noteDrafts: Record<string, string>;
  setNoteDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  noteSavingId: string | null;
  saveFeedbackNote: (feedbackId: string) => Promise<void>;
};

export const FeedbacksContext = createContext<FeedbacksContextValue | null>(null);
