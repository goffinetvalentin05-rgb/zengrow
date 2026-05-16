import type { FeedbackRecord } from "@/src/components/dashboard/feedbacks/types";

export type FeedbackKpisTrendTone = "success" | "warning" | "muted";

export type FeedbackKpis = {
  averageRating: number;
  totalFeedbacks: number;
  ratingMonthTrend: { label: string; tone: FeedbackKpisTrendTone };
  feedbacksThisMonth: number;
  responseRatePercent: number | null;
  servedReservationsThisMonth: number;
  pendingCount: number;
  lowRatingPendingCount: number;
};

type RatedRow = Pick<FeedbackRecord, "rating" | "created_at" | "read_at">;

function meanRating(rows: readonly RatedRow[]): number {
  if (rows.length === 0) return 0;
  const sum = rows.reduce((acc, row) => acc + row.rating, 0);
  return Math.round((sum / rows.length) * 10) / 10;
}

function countBetween(rows: readonly { created_at: string }[], startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return rows.reduce((acc, row) => {
    const t = new Date(row.created_at).getTime();
    if (Number.isNaN(t)) return acc;
    return t >= start && t <= end ? acc + 1 : acc;
  }, 0);
}

export function ratingAverageMonthTrend(
  currentAvg: number,
  previousAvg: number,
  currentCount: number,
  previousCount: number,
): { label: string; tone: FeedbackKpisTrendTone } {
  const suffix = " vs mois dernier";
  if (currentCount === 0 && previousCount === 0) {
    return { label: `→ stable${suffix}`, tone: "muted" };
  }
  if (previousCount === 0) {
    return { label: `—${suffix}`, tone: "muted" };
  }
  const delta = Math.round((currentAvg - previousAvg) * 10) / 10;
  if (delta === 0) {
    return { label: `→ stable${suffix}`, tone: "muted" };
  }
  const signed = delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
  return {
    label: `${signed}${suffix}`,
    tone: delta > 0 ? "success" : "warning",
  };
}

export function formatTotalFeedbacksSubline(count: number): string {
  if (count === 0) return "Sur 0 feedback";
  if (count === 1) return "Sur 1 feedback";
  return `Sur ${count} feedbacks`;
}

export function formatResponseRateSubline(ratePercent: number | null, servedCount: number): string {
  if (servedCount === 0) {
    return "Aucune réservation servie ce mois";
  }
  const rate = ratePercent ?? 0;
  const rateLabel = Number.isInteger(rate)
    ? String(rate)
    : rate.toLocaleString("fr-CH", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  if (servedCount === 1) {
    return `Taux de réponse ${rateLabel} % sur 1 résa servie`;
  }
  return `Taux de réponse ${rateLabel} % sur ${servedCount} résa servies`;
}

export function formatPendingSubline(lowRatingPendingCount: number): string {
  if (lowRatingPendingCount === 0) return "Notes < 3 prioritaires";
  if (lowRatingPendingCount === 1) return "1 note < 3 prioritaire";
  return `${lowRatingPendingCount} notes < 3 prioritaires`;
}

export function computeFeedbackKpis(
  feedbacks: readonly FeedbackRecord[],
  servedReservationsThisMonth: number,
  currentMonthStartIso: string,
  currentMonthEndIso: string,
  previousMonthStartIso: string,
  previousMonthEndIso: string,
): FeedbackKpis {
  const totalFeedbacks = feedbacks.length;
  const averageRating = meanRating(feedbacks);

  const currentMonthRows = feedbacks.filter((row) => {
    const t = new Date(row.created_at).getTime();
    const start = new Date(currentMonthStartIso).getTime();
    const end = new Date(currentMonthEndIso).getTime();
    return !Number.isNaN(t) && t >= start && t <= end;
  });

  const previousMonthRows = feedbacks.filter((row) => {
    const t = new Date(row.created_at).getTime();
    const start = new Date(previousMonthStartIso).getTime();
    const end = new Date(previousMonthEndIso).getTime();
    return !Number.isNaN(t) && t >= start && t <= end;
  });

  const feedbacksThisMonth = countBetween(feedbacks, currentMonthStartIso, currentMonthEndIso);
  const responseRatePercent =
    servedReservationsThisMonth > 0
      ? Math.round((feedbacksThisMonth / servedReservationsThisMonth) * 1000) / 10
      : null;

  const pending = feedbacks.filter((row) => row.read_at == null);
  const pendingCount = pending.length;
  const lowRatingPendingCount = pending.filter((row) => row.rating < 3).length;

  return {
    averageRating,
    totalFeedbacks,
    ratingMonthTrend: ratingAverageMonthTrend(
      meanRating(currentMonthRows),
      meanRating(previousMonthRows),
      currentMonthRows.length,
      previousMonthRows.length,
    ),
    feedbacksThisMonth,
    responseRatePercent,
    servedReservationsThisMonth,
    pendingCount,
    lowRatingPendingCount,
  };
}
