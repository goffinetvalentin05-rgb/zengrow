import BillingPlans from "@/src/components/dashboard/billing-plans";
import { requireRestaurant } from "@/src/lib/auth";

export default async function DashboardBillingPage() {
  const restaurant = await requireRestaurant();

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="dashboard-section-kicker">Abonnement</p>
        <h1 className="dashboard-page-title">Facturation</h1>
        <p className="dashboard-section-subtitle max-w-2xl">
          L&apos;offre qui correspond à votre établissement.
        </p>
      </header>
      <BillingPlans
        status={restaurant.subscription_status}
        plan={restaurant.subscription_plan}
        trialEndDate={restaurant.trial_end_date}
      />
    </div>
  );
}
