import type { FeedbackRecord, FeedbackRatingCriteria } from "@/src/components/dashboard/feedbacks/types";

type ReservationEmbed = {
  reservation_date: string;
  customer_id: string | null;
  guests: number | null;
};

export type FeedbackRowDb = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  rating: number;
  message: string | null;
  responded_at: string | null;
  read_at: string | null;
  internal_note: string | null;
  rating_criteria?: unknown;
  reservation_id: string;
  reservation: ReservationEmbed | ReservationEmbed[] | null;
};

function parseRatingCriteria(raw: unknown): FeedbackRatingCriteria | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const cuisine = typeof o.cuisine === "number" ? o.cuisine : undefined;
  const service = typeof o.service === "number" ? o.service : undefined;
  const ambiance = typeof o.ambiance === "number" ? o.ambiance : undefined;
  if (cuisine == null && service == null && ambiance == null) return null;
  return { cuisine, service, ambiance };
}

export function mapFeedbackRow(row: FeedbackRowDb): FeedbackRecord {
  const reservation = Array.isArray(row.reservation) ? row.reservation[0] : row.reservation;

  return {
    id: row.id,
    created_at: row.created_at,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    rating: row.rating,
    message: row.message,
    read_at: row.read_at,
    internal_note: row.internal_note,
    rating_criteria: parseRatingCriteria(row.rating_criteria),
    reservation_id: row.reservation_id,
    reservation_date: reservation?.reservation_date ?? null,
    customer_id: reservation?.customer_id ?? null,
    guests: reservation?.guests ?? null,
  };
}
