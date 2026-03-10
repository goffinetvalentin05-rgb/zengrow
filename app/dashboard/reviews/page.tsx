import ReviewAutomationPanel from "@/src/components/dashboard/review-automation-panel";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

export default async function DashboardReviewsPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();

  const { data: automation } = await supabase
    .from("review_automation_settings")
    .select(
      "id, is_enabled, channel, delay_minutes, google_review_url, email_subject, email_message, button_positive_label, button_neutral_label, button_negative_label, primary_color",
    )
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
        google_review_url: automation?.google_review_url ?? "",
        email_subject: automation?.email_subject ?? "How was your experience at {{restaurant_name}}?",
        email_message:
          automation?.email_message ??
          "Thank you for visiting {{restaurant_name}}.\nWe would love to hear about your experience.",
        button_positive_label: automation?.button_positive_label ?? "Excellent",
        button_neutral_label: automation?.button_neutral_label ?? "Average",
        button_negative_label: automation?.button_negative_label ?? "Not great",
        primary_color: automation?.primary_color ?? "#1F7A6C",
      }}
      initialFeedback={feedback ?? []}
    />
  );
}
