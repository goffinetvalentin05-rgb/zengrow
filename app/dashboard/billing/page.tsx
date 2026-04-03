import BillingPlans from "@/src/components/dashboard/billing-plans";
import { requireRestaurant } from "@/src/lib/auth";

export default async function DashboardBillingPage() {
  const restaurant = await requireRestaurant();

  return (
    <div className="space-y-12">
      <header>
        <h1 className="dashboard-page-title">Facturation</h1>
        <p className="dashboard-section-subtitle mt-2 max-w-2xl">Formule et essai — sans surprise.</p>
      </header>
      <BillingPlans
        status={restaurant.subscription_status}
        plan={restaurant.subscription_plan}
        trialEndDate={restaurant.trial_end_date}
      />
    </div>
  );
}
