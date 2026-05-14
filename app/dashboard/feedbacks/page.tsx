import PageHeader from "@/src/components/dashboard/page-header";
import FeedbacksDashboard, { type FeedbackDashboardRow } from "@/src/components/dashboard/feedbacks-dashboard";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardFeedbacksPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();

  const { data } = await supabase
    .from("feedbacks")
    .select("id, created_at, customer_name, customer_email, rating, message, responded_at")
    .eq("restaurant_id", restaurant.id)
    .not("responded_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (data ?? []) as FeedbackDashboardRow[];

  return (
    <DashboardContent>
      <div className="space-y-10">
        <PageHeader
          title="Feedbacks"
          subtitle="Retours privés laissés par tes clients après leur visite (hors avis publics Google)."
        />
        <FeedbacksDashboard initialRows={rows} />
      </div>
    </DashboardContent>
  );
}
