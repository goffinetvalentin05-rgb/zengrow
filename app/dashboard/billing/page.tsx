import BillingPlans from "@/src/components/dashboard/billing-plans";
import { requireRestaurant } from "@/src/lib/auth";

export default async function DashboardBillingPage() {
  const restaurant = await requireRestaurant();

  return (
    <div className="space-y-10">
      <header className="border-b border-zg-border/80 pb-7">
        <h1 className="dashboard-section-heading">Facturation</h1>
        <p className="dashboard-section-subtitle mt-2 max-w-2xl">Formule, essai et souscription ZenGrow.</p>
      </header>
      <BillingPlans
        status={restaurant.subscription_status}
        plan={restaurant.subscription_plan}
        trialEndDate={restaurant.trial_end_date}
      />
    </div>
  );
}
