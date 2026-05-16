"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { FeedbacksContext } from "@/src/components/dashboard/feedbacks/context/feedbacks-context";
import type { FeedbacksPageProps } from "@/src/components/dashboard/feedbacks/types";
import {
  buildFeedbackFilterPills,
  clearFeedbackFilterKey,
  countActiveFeedbackFilters,
  DEFAULT_FEEDBACK_FILTERS,
  filterFeedbacks,
  type FeedbackFilterPillKey,
} from "@/src/components/dashboard/feedbacks/utils/feedback-filters";

type FeedbacksProviderProps = FeedbacksPageProps & {
  children: ReactNode;
};

export function FeedbacksProvider({ feedbacks, kpis, children }: FeedbacksProviderProps) {
  const [filters, setFilters] = useState(DEFAULT_FEEDBACK_FILTERS);

  const filteredFeedbacks = useMemo(
    () => filterFeedbacks(feedbacks, filters),
    [feedbacks, filters],
  );

  const filterPills = useMemo(() => buildFeedbackFilterPills(filters), [filters]);
  const activeFilterCount = useMemo(() => countActiveFeedbackFilters(filters), [filters]);

  const clearFilter = useCallback((key: FeedbackFilterPillKey) => {
    setFilters((prev) => clearFeedbackFilterKey(prev, key));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FEEDBACK_FILTERS);
  }, []);

  const value = useMemo(
    () => ({
      feedbacks,
      filteredFeedbacks,
      kpis,
      filters,
      setFilters,
      filterPills,
      clearFilter,
      resetFilters,
      activeFilterCount,
    }),
    [
      feedbacks,
      filteredFeedbacks,
      kpis,
      filters,
      filterPills,
      clearFilter,
      resetFilters,
      activeFilterCount,
    ],
  );

  return <FeedbacksContext.Provider value={value}>{children}</FeedbacksContext.Provider>;
}
