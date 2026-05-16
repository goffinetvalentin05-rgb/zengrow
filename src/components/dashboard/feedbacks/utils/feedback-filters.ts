import type { FeedbackRecord } from "@/src/components/dashboard/feedbacks/types";
import { feedbackYmdInBusinessTz } from "@/src/components/dashboard/feedbacks/utils/feedback-trend";
import { normalizeYmd } from "@/src/components/dashboard/customers/utils/customer-filters";

export type FeedbackReadStatusFilter = "all" | "unread" | "read";
export type FeedbackCommentFilter = "all" | "with" | "without";

export type FeedbackFilters = {
  query: string;
  periodFrom: string | null;
  periodTo: string | null;
  ratingMin: number;
  ratingMax: number;
  readStatus: FeedbackReadStatusFilter;
  commentFilter: FeedbackCommentFilter;
};

export type FeedbackFilterPillKey =
  | "query"
  | "periodRange"
  | "ratingRange"
  | "readStatus"
  | "commentFilter";

export type FeedbackFilterPill = {
  key: FeedbackFilterPillKey;
  label: string;
};

export const DEFAULT_FEEDBACK_FILTERS: FeedbackFilters = {
  query: "",
  periodFrom: null,
  periodTo: null,
  ratingMin: 1,
  ratingMax: 5,
  readStatus: "all",
  commentFilter: "all",
};

function matchesQuery(row: FeedbackRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const name = (row.customer_name ?? "").toLowerCase();
  const mail = (row.customer_email ?? "").toLowerCase();
  const message = (row.message ?? "").toLowerCase();
  return name.includes(q) || mail.includes(q) || message.includes(q);
}

function matchesPeriod(row: FeedbackRecord, from: string | null, to: string | null): boolean {
  if (!from && !to) return true;
  const ymd = feedbackYmdInBusinessTz(row.created_at);
  if (!ymd) return false;
  if (from && ymd < from) return false;
  if (to && ymd > to) return false;
  return true;
}

function matchesRating(row: FeedbackRecord, min: number, max: number): boolean {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return row.rating >= lo && row.rating <= hi;
}

function matchesReadStatus(row: FeedbackRecord, filter: FeedbackReadStatusFilter): boolean {
  if (filter === "all") return true;
  const isRead = row.read_at != null;
  if (filter === "read") return isRead;
  return !isRead;
}

function matchesComment(row: FeedbackRecord, filter: FeedbackCommentFilter): boolean {
  if (filter === "all") return true;
  const hasComment = Boolean(row.message?.trim());
  if (filter === "with") return hasComment;
  return !hasComment;
}

export function filterFeedbacks(
  feedbacks: readonly FeedbackRecord[],
  filters: FeedbackFilters,
): FeedbackRecord[] {
  return feedbacks.filter((row) => {
    if (!matchesQuery(row, filters.query)) return false;
    if (!matchesPeriod(row, filters.periodFrom, filters.periodTo)) return false;
    if (!matchesRating(row, filters.ratingMin, filters.ratingMax)) return false;
    if (!matchesReadStatus(row, filters.readStatus)) return false;
    if (!matchesComment(row, filters.commentFilter)) return false;
    return true;
  });
}

export function countActiveFeedbackFilters(filters: FeedbackFilters): number {
  let n = 0;
  if (filters.query.trim()) n += 1;
  if (filters.periodFrom || filters.periodTo) n += 1;
  if (filters.ratingMin !== 1 || filters.ratingMax !== 5) n += 1;
  if (filters.readStatus !== "all") n += 1;
  if (filters.commentFilter !== "all") n += 1;
  return n;
}

function formatYmdFr(ymd: string): string {
  const normalized = normalizeYmd(ymd);
  if (!normalized) return ymd;
  const [y, m, d] = normalized.split("-");
  if (!y || !m || !d) return ymd;
  return `${d}.${m}.${y}`;
}

const READ_STATUS_LABELS: Record<Exclude<FeedbackReadStatusFilter, "all">, string> = {
  unread: "Non lus",
  read: "Traités",
};

const COMMENT_LABELS: Record<Exclude<FeedbackCommentFilter, "all">, string> = {
  with: "Avec commentaire",
  without: "Sans commentaire",
};

export function buildFeedbackFilterPills(filters: FeedbackFilters): FeedbackFilterPill[] {
  const pills: FeedbackFilterPill[] = [];
  const q = filters.query.trim();
  if (q) {
    pills.push({ key: "query", label: `Recherche : ${q}` });
  }
  if (filters.periodFrom || filters.periodTo) {
    const from = filters.periodFrom ? formatYmdFr(filters.periodFrom) : "…";
    const to = filters.periodTo ? formatYmdFr(filters.periodTo) : "…";
    pills.push({ key: "periodRange", label: `Période : ${from} – ${to}` });
  }
  if (filters.ratingMin !== 1 || filters.ratingMax !== 5) {
    const lo = Math.min(filters.ratingMin, filters.ratingMax);
    const hi = Math.max(filters.ratingMin, filters.ratingMax);
    pills.push({ key: "ratingRange", label: `Note : ${lo}–${hi}` });
  }
  if (filters.readStatus !== "all") {
    pills.push({ key: "readStatus", label: READ_STATUS_LABELS[filters.readStatus] });
  }
  if (filters.commentFilter !== "all") {
    pills.push({ key: "commentFilter", label: COMMENT_LABELS[filters.commentFilter] });
  }
  return pills;
}

export function clearFeedbackFilterKey(
  filters: FeedbackFilters,
  key: FeedbackFilterPillKey,
): FeedbackFilters {
  switch (key) {
    case "query":
      return { ...filters, query: "" };
    case "periodRange":
      return { ...filters, periodFrom: null, periodTo: null };
    case "ratingRange":
      return { ...filters, ratingMin: 1, ratingMax: 5 };
    case "readStatus":
      return { ...filters, readStatus: "all" };
    case "commentFilter":
      return { ...filters, commentFilter: "all" };
    default:
      return filters;
  }
}
