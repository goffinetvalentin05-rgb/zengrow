import BillingPlans from "@/src/components/dashboard/billing-plans";
import { requireRestaurant } from "@/src/lib/auth";

export default async function DashboardBillingPage() {
  const restaurant = await requireRestaurant();

  return (
    <BillingPlans
      status={restaurant.subscription_status}
      plan={restaurant.subscription_plan}
      trialEndDate={restaurant.trial_end_date}
    />
  );
}
