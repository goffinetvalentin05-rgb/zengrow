import ReviewAutomationPanel from "@/src/components/dashboard/review-automation-panel";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

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
    .from("feedbacks")
    .select("id, message, created_at")
    .eq("restaurant_id", restaurant.id)
    .not("responded_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-10">
      <header className="border-b border-gray-100 pb-6">
        <h1 className="dashboard-section-heading">Avis Google</h1>
        <p className="dashboard-section-subtitle mt-2 max-w-2xl">
          Envoyez automatiquement un message après la visite pour collecter des avis.
        </p>
      </header>
      <ReviewAutomationPanel
        key={`${restaurant.id}-${automation?.id ?? "none"}-${String(automation?.is_enabled ?? false)}`}
        restaurantId={restaurant.id}
        initialSettings={{
          is_enabled: automation?.is_enabled ?? false,
          channel: "email",
          delay_minutes: automation?.delay_minutes ?? 90,
          google_review_url: automation?.google_review_url ?? "",
          email_subject:
            automation?.email_subject ?? "Comment s'est passée votre expérience chez {{restaurant_name}} ?",
          email_message:
            automation?.email_message ??
            "Merci pour votre visite chez {{restaurant_name}}.\nNous aimerions connaître votre expérience.",
          button_positive_label: automation?.button_positive_label ?? "Excellent",
          button_neutral_label: automation?.button_neutral_label ?? "Moyen",
          button_negative_label: automation?.button_negative_label ?? "À améliorer",
          primary_color: automation?.primary_color ?? "#1A6B50",
        }}
        initialFeedback={feedback ?? []}
      />
    </div>
  );
}
