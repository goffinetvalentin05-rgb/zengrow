import AIDashboardPage from "@/src/components/dashboard/ai/ai-dashboard-page";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { requireRestaurant } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardAIPage() {
  const restaurant = await requireRestaurant();

  return (
    <DashboardContent>
      <AIDashboardPage restaurantId={restaurant.id} restaurantName={restaurant.name} />
    </DashboardContent>
  );
}
