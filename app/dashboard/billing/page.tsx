import BillingPlans from "@/src/components/dashboard/billing-plans";
import { requireRestaurantSession } from "@/src/lib/auth";

export default async function DashboardBillingPage() {
  const { restaurant, access } = await requireRestaurantSession();

  return (
    <div className="space-y-10">
      <header className="border-b border-zg-border/80 pb-7">
        <h1 className="dashboard-section-heading">Facturation</h1>
        <p className="dashboard-section-subtitle mt-2 max-w-2xl">
          {access.isOwnerDev
            ? "Compte développeur : accès Pro inclus. Vous pouvez quand même souscrire via Stripe si besoin."
            : "Formule, essai et souscription ZenGrow."}
        </p>
      </header>
      <BillingPlans
        status={access.effectiveStatus}
        plan={access.effectivePlan}
        trialEndDate={restaurant.trial_end_date}
        isOwnerDev={access.isOwnerDev}
      />
    </div>
  );
}
