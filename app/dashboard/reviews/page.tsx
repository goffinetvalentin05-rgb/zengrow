import ReviewAutomationPanel from "@/src/components/dashboard/review-automation-panel";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

export default async function DashboardReviewsPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();

  const { data: automation } = await supabase
    .from("review_automation_settings")
    .select("id, is_enabled, channel, delay_minutes, message_template, google_review_url")
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  const { data: feedback } = await supabase
    .from("customer_feedback")
    .select("id, rating, message, created_at")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <ReviewAutomationPanel
      restaurantId={restaurant.id}
      initialSettings={{
        is_enabled: automation?.is_enabled ?? false,
        channel: "email",
        delay_minutes: automation?.delay_minutes ?? 90,
        message_template:
          automation?.message_template ??
          "Merci pour votre visite chez {{restaurant_name}}. Votre avis Google nous aide enormement : {{google_review_url}}",
        google_review_url: automation?.google_review_url ?? "",
      }}
      initialFeedback={feedback ?? []}
    />
  );
}
