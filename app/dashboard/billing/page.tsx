import { CreditCard } from "lucide-react";
import BillingPlans from "@/src/components/dashboard/billing-plans";
import { requireRestaurant } from "@/src/lib/auth";

export default async function DashboardBillingPage() {
  const restaurant = await requireRestaurant();

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
          <CreditCard size={22} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="dashboard-page-title">Facturation</h1>
          <p className="dashboard-section-subtitle mt-2 max-w-2xl">
            Choisissez l&apos;offre qui correspond à votre établissement — sans surprise.
          </p>
        </div>
      </div>
      <BillingPlans
        status={restaurant.subscription_status}
        plan={restaurant.subscription_plan}
        trialEndDate={restaurant.trial_end_date}
      />
    </div>
  );
}
