import { Star } from "lucide-react";
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
    .from("feedbacks")
    .select("id, message, created_at")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
          <Star size={22} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="dashboard-page-title">Avis Google</h1>
          <p className="dashboard-section-subtitle mt-2 max-w-2xl">
            Après le repas, invitez vos clients à laisser un avis — sans effort pour vous.
          </p>
        </div>
      </div>
      <ReviewAutomationPanel
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
