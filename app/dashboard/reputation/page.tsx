import { subMonths } from "date-fns";
import ReputationPage from "@/src/components/dashboard/reputation/reputation-page";
import { mapFeedbackRow, type FeedbackRowDb } from "@/src/components/dashboard/feedbacks/utils/map-feedback-row";
import { computeFeedbackKpis } from "@/src/components/dashboard/feedbacks/utils/feedback-kpis";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurantSession } from "@/src/lib/auth";
import { canAccessAI } from "@/src/lib/ai/access";
import {
  endOfBusinessYmdAsUtcIso,
  monthBoundsInBusinessTz,
  startOfBusinessYmdAsUtcIso,
} from "@/src/lib/date/business-calendar";
import { createClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

const DEFAULT_REVIEW_AUTOMATION = {
  is_enabled: false,
  delay_minutes: 90,
  google_review_url: "",
  email_subject: "Comment s'est passée votre expérience chez {{restaurant_name}} ?",
  email_message:
    "Merci pour votre visite chez {{restaurant_name}}.\nNous aimerions connaître votre expérience.",
  button_positive_label: "Excellent",
  button_neutral_label: "Moyen",
  button_negative_label: "À améliorer",
  primary_color: "#1A6B50",
};

export default async function DashboardReputationPage() {
  const supabase = await createClient();
  const { restaurant, access } = await requireRestaurantSession();
  const canUseAI =
    access.isOwnerDev ||
    canAccessAI(restaurant.subscription_plan, restaurant.subscription_status);

  const now = new Date();
  const currentMonth = monthBoundsInBusinessTz(now);
  const previousMonth = monthBoundsInBusinessTz(subMonths(now, 1));
  const currentMonthStart = startOfBusinessYmdAsUtcIso(currentMonth.startYmd);
  const currentMonthEnd = endOfBusinessYmdAsUtcIso(currentMonth.endYmd);
  const previousMonthStart = startOfBusinessYmdAsUtcIso(previousMonth.startYmd);
  const previousMonthEnd = endOfBusinessYmdAsUtcIso(previousMonth.endYmd);

  const [{ data: feedbackRows }, { count: servedReservationsThisMonth }, { data: automation }] =
    await Promise.all([
      supabase
        .from("feedbacks")
        .select(
          `
        id,
        created_at,
        customer_name,
        customer_email,
        rating,
        message,
        responded_at,
        read_at,
        internal_note,
        ai_analysis,
        reservation_id,
        reservation:reservations (
          reservation_date,
          customer_id,
          guests
        )
      `,
        )
        .eq("restaurant_id", restaurant.id)
        .not("responded_at", "is", null)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id)
        .eq("status", "completed")
        .neq("reservation_type", "walkin")
        .gte("reservation_date", currentMonth.startYmd)
        .lte("reservation_date", currentMonth.endYmd),
      supabase
        .from("review_automation_settings")
        .select(
          "is_enabled, delay_minutes, google_review_url, email_subject, email_message, button_positive_label, button_neutral_label, button_negative_label, primary_color",
        )
        .eq("restaurant_id", restaurant.id)
        .maybeSingle(),
    ]);

  const feedbacks = (feedbackRows ?? []).map((row) => mapFeedbackRow(row as FeedbackRowDb));
  const servedCount = servedReservationsThisMonth ?? 0;
  const kpis = computeFeedbackKpis(
    feedbacks,
    servedCount,
    currentMonthStart,
    currentMonthEnd,
    previousMonthStart,
    previousMonthEnd,
  );

  const reviewAutomation = {
    is_enabled: automation?.is_enabled ?? DEFAULT_REVIEW_AUTOMATION.is_enabled,
    delay_minutes: automation?.delay_minutes ?? DEFAULT_REVIEW_AUTOMATION.delay_minutes,
    google_review_url: automation?.google_review_url ?? DEFAULT_REVIEW_AUTOMATION.google_review_url,
    email_subject: automation?.email_subject ?? DEFAULT_REVIEW_AUTOMATION.email_subject,
    email_message: automation?.email_message ?? DEFAULT_REVIEW_AUTOMATION.email_message,
    button_positive_label:
      automation?.button_positive_label ?? DEFAULT_REVIEW_AUTOMATION.button_positive_label,
    button_neutral_label:
      automation?.button_neutral_label ?? DEFAULT_REVIEW_AUTOMATION.button_neutral_label,
    button_negative_label:
      automation?.button_negative_label ?? DEFAULT_REVIEW_AUTOMATION.button_negative_label,
    primary_color: automation?.primary_color ?? DEFAULT_REVIEW_AUTOMATION.primary_color,
  };

  return (
    <DashboardContent>
      <ReputationPage
        feedbacks={feedbacks}
        kpis={kpis}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        servedReservationsThisMonth={servedCount}
        canUseAI={canUseAI}
        reviewAutomation={reviewAutomation}
        kpiMonthBounds={{
          currentMonthStart,
          currentMonthEnd,
          previousMonthStart,
          previousMonthEnd,
        }}
      />
    </DashboardContent>
  );
}
