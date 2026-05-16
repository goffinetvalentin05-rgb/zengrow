import { startOfISOWeek, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { formatInTimeZone, toDate, toZonedTime } from "date-fns-tz";
import type { FeedbackRecord } from "@/src/components/dashboard/feedbacks/types";
import { businessCalendarTimeZone, lastNYmdDaysInBusinessTz } from "@/src/lib/date/business-calendar";

export type FeedbackTrendPeriod = 30 | 90 | 365;

export type FeedbackTrendPoint = {
  key: string;
  label: string;
  averageRating: number | null;
  count: number;
};

export const MIN_FEEDBACKS_FOR_TREND_CHART = 5;

type RatedFeedback = Pick<FeedbackRecord, "created_at" | "rating">;

export function feedbackYmdInBusinessTz(createdAt: string): string | null {
  try {
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return null;
    return formatInTimeZone(d, businessCalendarTimeZone(), "yyyy-MM-dd");
  } catch {
    return null;
  }
}

function weekStartYmdInBusinessTz(ymd: string): string {
  const tz = businessCalendarTimeZone();
  const ref = toDate(`${ymd}T12:00:00`, { timeZone: tz });
  const zoned = toZonedTime(ref, tz);
  return formatInTimeZone(startOfISOWeek(zoned), tz, "yyyy-MM-dd");
}

function meanRating(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

function formatDayLabel(ymd: string): string {
  const tz = businessCalendarTimeZone();
  const ref = toDate(`${ymd}T12:00:00`, { timeZone: tz });
  return formatInTimeZone(ref, tz, "d MMM", { locale: fr });
}

function formatWeekLabel(weekStartYmd: string): string {
  const tz = businessCalendarTimeZone();
  const ref = toDate(`${weekStartYmd}T12:00:00`, { timeZone: tz });
  return formatInTimeZone(ref, tz, "d MMM", { locale: fr });
}

function ratingsByYmd(feedbacks: readonly RatedFeedback[]): Map<string, number[]> {
  const map = new Map<string, number[]>();
  for (const row of feedbacks) {
    const ymd = feedbackYmdInBusinessTz(row.created_at);
    if (!ymd) continue;
    const bucket = map.get(ymd) ?? [];
    bucket.push(row.rating);
    map.set(ymd, bucket);
  }
  return map;
}

function shouldUseWeeklyBuckets(
  feedbacksInPeriod: readonly RatedFeedback[],
  periodDays: FeedbackTrendPeriod,
): boolean {
  if (periodDays >= 90) return true;
  const byDay = ratingsByYmd(feedbacksInPeriod);
  const daysWithData = byDay.size;
  if (periodDays === 30 && daysWithData > 0 && daysWithData < 7) return true;
  return false;
}

function filterFeedbacksInPeriod(
  feedbacks: readonly RatedFeedback[],
  periodDays: FeedbackTrendPeriod,
  ref: Date,
): RatedFeedback[] {
  const days = lastNYmdDaysInBusinessTz(periodDays, ref);
  const startYmd = days[0];
  const endYmd = days[days.length - 1];
  if (!startYmd || !endYmd) return [];
  return feedbacks.filter((row) => {
    const ymd = feedbackYmdInBusinessTz(row.created_at);
    if (!ymd) return false;
    return ymd >= startYmd && ymd <= endYmd;
  });
}

function buildDailySeries(
  feedbacksInPeriod: readonly RatedFeedback[],
  periodDays: FeedbackTrendPeriod,
  ref: Date,
): FeedbackTrendPoint[] {
  const days = lastNYmdDaysInBusinessTz(periodDays, ref);
  const byDay = ratingsByYmd(feedbacksInPeriod);
  return days.map((ymd) => {
    const ratings = byDay.get(ymd) ?? [];
    return {
      key: ymd,
      label: formatDayLabel(ymd),
      averageRating: meanRating(ratings),
      count: ratings.length,
    };
  });
}

function buildWeeklySeries(
  feedbacksInPeriod: readonly RatedFeedback[],
  periodDays: FeedbackTrendPeriod,
  ref: Date,
): FeedbackTrendPoint[] {
  const tz = businessCalendarTimeZone();
  const zoned = toZonedTime(ref, tz);
  const periodStart = formatInTimeZone(subDays(zoned, periodDays - 1), tz, "yyyy-MM-dd");

  const byWeek = new Map<string, number[]>();
  for (const row of feedbacksInPeriod) {
    const ymd = feedbackYmdInBusinessTz(row.created_at);
    if (!ymd || ymd < periodStart) continue;
    const weekKey = weekStartYmdInBusinessTz(ymd);
    const bucket = byWeek.get(weekKey) ?? [];
    bucket.push(row.rating);
    byWeek.set(weekKey, bucket);
  }

  const weekKeys = [...byWeek.keys()].sort();
  return weekKeys.map((weekKey) => {
    const ratings = byWeek.get(weekKey) ?? [];
    return {
      key: weekKey,
      label: formatWeekLabel(weekKey),
      averageRating: meanRating(ratings),
      count: ratings.length,
    };
  });
}

export function hasEnoughFeedbacksForTrend(totalFeedbacks: number): boolean {
  return totalFeedbacks >= MIN_FEEDBACKS_FOR_TREND_CHART;
}

export function buildFeedbackTrendSeries(
  feedbacks: readonly RatedFeedback[],
  periodDays: FeedbackTrendPeriod,
  ref: Date = new Date(),
): { points: FeedbackTrendPoint[]; granularity: "day" | "week" } {
  const inPeriod = filterFeedbacksInPeriod(feedbacks, periodDays, ref);
  const weekly = shouldUseWeeklyBuckets(inPeriod, periodDays);
  const points = weekly
    ? buildWeeklySeries(inPeriod, periodDays, ref)
    : buildDailySeries(inPeriod, periodDays, ref);
  return { points, granularity: weekly ? "week" : "day" };
}

export function trendSeriesHasPlottableAverage(points: readonly FeedbackTrendPoint[]): boolean {
  return points.some((p) => p.averageRating != null);
}
