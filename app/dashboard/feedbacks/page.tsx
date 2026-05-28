import { subMonths } from "date-fns";
import FeedbacksPage from "@/src/components/dashboard/feedbacks/feedbacks-page";
import { mapFeedbackRow, type FeedbackRowDb } from "@/src/components/dashboard/feedbacks/utils/map-feedback-row";
import { computeFeedbackKpis } from "@/src/components/dashboard/feedbacks/utils/feedback-kpis";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurant } from "@/src/lib/auth";
import {
  endOfBusinessYmdAsUtcIso,
  monthBoundsInBusinessTz,
  startOfBusinessYmdAsUtcIso,
} from "@/src/lib/date/business-calendar";
import { createClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardFeedbacksPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();

  const now = new Date();
  const currentMonth = monthBoundsInBusinessTz(now);
  const previousMonth = monthBoundsInBusinessTz(subMonths(now, 1));
  const currentMonthStart = startOfBusinessYmdAsUtcIso(currentMonth.startYmd);
  const currentMonthEnd = endOfBusinessYmdAsUtcIso(currentMonth.endYmd);
  const previousMonthStart = startOfBusinessYmdAsUtcIso(previousMonth.startYmd);
  const previousMonthEnd = endOfBusinessYmdAsUtcIso(previousMonth.endYmd);

  const [{ data: feedbackRows }, { count: servedReservationsThisMonth }] = await Promise.all([
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

  return (
    <DashboardContent>
      <FeedbacksPage
        feedbacks={feedbacks}
        kpis={kpis}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        servedReservationsThisMonth={servedCount}
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
