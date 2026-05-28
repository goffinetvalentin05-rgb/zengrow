"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { FeedbacksContext } from "@/src/components/dashboard/feedbacks/context/feedbacks-context";
import type { FeedbacksPageProps } from "@/src/components/dashboard/feedbacks/types";
import type { PrivateFeedbackAIAnalysis } from "@/src/lib/ai/types";
import {
  buildFeedbackFilterPills,
  clearFeedbackFilterKey,
  countActiveFeedbackFilters,
  DEFAULT_FEEDBACK_FILTERS,
  filterFeedbacks,
  type FeedbackFilterPillKey,
} from "@/src/components/dashboard/feedbacks/utils/feedback-filters";
import { computeFeedbackKpis } from "@/src/components/dashboard/feedbacks/utils/feedback-kpis";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { createClient } from "@/src/lib/supabase/client";
import { AlertCircle } from "lucide-react";

function noteDraftsFromFeedbacks(feedbacks: FeedbacksPageProps["feedbacks"]) {
  return Object.fromEntries(
    feedbacks.map((row) => [row.id, row.internal_note ?? ""]),
  );
}

type FeedbacksProviderProps = FeedbacksPageProps & {
  children: ReactNode;
};

export function FeedbacksProvider({
  feedbacks: initialFeedbacks,
  restaurantId,
  restaurantName,
  servedReservationsThisMonth,
  kpiMonthBounds,
  children,
}: FeedbacksProviderProps) {
  const showToast = useDashboardToast();
  const [feedbackRecords, setFeedbackRecords] = useState(initialFeedbacks);
  const [filters, setFilters] = useState(DEFAULT_FEEDBACK_FILTERS);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const [markFeedbackSavingId, setMarkFeedbackSavingId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(() =>
    noteDraftsFromFeedbacks(initialFeedbacks),
  );
  const [noteSavingId, setNoteSavingId] = useState<string | null>(null);

  useEffect(() => {
    setFeedbackRecords(initialFeedbacks);
    setNoteDrafts((prev) => {
      const next = { ...prev };
      for (const row of initialFeedbacks) {
        next[row.id] = row.internal_note ?? "";
      }
      return next;
    });
  }, [initialFeedbacks]);

  const kpis = useMemo(
    () =>
      computeFeedbackKpis(
        feedbackRecords,
        servedReservationsThisMonth,
        kpiMonthBounds.currentMonthStart,
        kpiMonthBounds.currentMonthEnd,
        kpiMonthBounds.previousMonthStart,
        kpiMonthBounds.previousMonthEnd,
      ),
    [feedbackRecords, servedReservationsThisMonth, kpiMonthBounds],
  );

  const filteredFeedbacks = useMemo(
    () => filterFeedbacks(feedbackRecords, filters),
    [feedbackRecords, filters],
  );

  const filterPills = useMemo(() => buildFeedbackFilterPills(filters), [filters]);
  const activeFilterCount = useMemo(() => countActiveFeedbackFilters(filters), [filters]);

  const selectedFeedback = useMemo(
    () => feedbackRecords.find((f) => f.id === selectedFeedbackId) ?? null,
    [feedbackRecords, selectedFeedbackId],
  );

  const clearFilter = useCallback((key: FeedbackFilterPillKey) => {
    setFilters((prev) => clearFeedbackFilterKey(prev, key));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FEEDBACK_FILTERS);
  }, []);

  const openFeedbackDetail = useCallback((feedbackId: string) => {
    setSelectedFeedbackId(feedbackId);
  }, []);

  const closeFeedbackDetail = useCallback(() => {
    setSelectedFeedbackId(null);
  }, []);

  const updateReadAt = useCallback(
    async (feedbackId: string, readAt: string | null) => {
      let previousReadAt: string | null = null;
      setFeedbackRecords((prev) => {
        const current = prev.find((row) => row.id === feedbackId);
        previousReadAt = current?.read_at ?? null;
        return prev.map((row) => (row.id === feedbackId ? { ...row, read_at: readAt } : row));
      });
      setMarkFeedbackSavingId(feedbackId);

      const supabase = createClient();
      const { data, error } = await supabase
        .from("feedbacks")
        .update({ read_at: readAt })
        .eq("id", feedbackId)
        .select("id")
        .maybeSingle();

      setMarkFeedbackSavingId(null);

      if (error || !data) {
        setFeedbackRecords((prev) =>
          prev.map((row) => (row.id === feedbackId ? { ...row, read_at: previousReadAt } : row)),
        );
        showToast({
          message: error?.message ?? "Impossible de mettre à jour le statut de lecture.",
          icon: AlertCircle,
        });
        return false;
      }

      showToast({
        message: readAt ? "Marqué comme lu" : "Marqué comme non lu",
        durationMs: 1500,
      });
      return true;
    },
    [showToast],
  );

  const markFeedbackRead = useCallback(
    async (feedbackId: string) => {
      await updateReadAt(feedbackId, new Date().toISOString());
    },
    [updateReadAt],
  );

  const markFeedbackUnread = useCallback(
    async (feedbackId: string) => {
      await updateReadAt(feedbackId, null);
    },
    [updateReadAt],
  );

  const saveFeedbackNote = useCallback(
    async (feedbackId: string) => {
      const internalNote = noteDrafts[feedbackId] ?? "";
      const trimmed = internalNote.trim() || null;
      let previousNote: string | null = null;

      setFeedbackRecords((prev) => {
        const current = prev.find((row) => row.id === feedbackId);
        previousNote = current?.internal_note ?? null;
        return prev.map((row) =>
          row.id === feedbackId ? { ...row, internal_note: trimmed } : row,
        );
      });

      setNoteSavingId(feedbackId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("feedbacks")
        .update({ internal_note: trimmed })
        .eq("id", feedbackId)
        .select("id")
        .maybeSingle();

      setNoteSavingId(null);

      if (error || !data) {
        setFeedbackRecords((prev) =>
          prev.map((row) =>
            row.id === feedbackId ? { ...row, internal_note: previousNote } : row,
          ),
        );
        setNoteDrafts((prev) => ({ ...prev, [feedbackId]: previousNote ?? "" }));
        showToast({
          message: error?.message ?? "Impossible d'enregistrer la note interne.",
          icon: AlertCircle,
        });
        return;
      }
    },
    [noteDrafts, showToast],
  );

  const updateFeedbackAiAnalysis = useCallback(
    (feedbackId: string, analysis: PrivateFeedbackAIAnalysis) => {
      setFeedbackRecords((prev) =>
        prev.map((row) => (row.id === feedbackId ? { ...row, ai_analysis: analysis } : row)),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      feedbacks: feedbackRecords,
      filteredFeedbacks,
      kpis,
      restaurantId,
      restaurantName,
      filters,
      setFilters,
      filterPills,
      clearFilter,
      resetFilters,
      activeFilterCount,
      selectedFeedbackId,
      selectedFeedback,
      openFeedbackDetail,
      closeFeedbackDetail,
      markFeedbackRead,
      markFeedbackUnread,
      markFeedbackSavingId,
      noteDrafts,
      setNoteDrafts,
      noteSavingId,
      saveFeedbackNote,
      updateFeedbackAiAnalysis,
    }),
    [
      feedbackRecords,
      filteredFeedbacks,
      kpis,
      restaurantId,
      restaurantName,
      filters,
      filterPills,
      clearFilter,
      resetFilters,
      activeFilterCount,
      selectedFeedbackId,
      selectedFeedback,
      openFeedbackDetail,
      closeFeedbackDetail,
      markFeedbackRead,
      markFeedbackUnread,
      markFeedbackSavingId,
      noteDrafts,
      noteSavingId,
      saveFeedbackNote,
      updateFeedbackAiAnalysis,
    ],
  );

  return <FeedbacksContext.Provider value={value}>{children}</FeedbacksContext.Provider>;
}
