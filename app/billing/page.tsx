import BillingPlans from "@/src/components/dashboard/billing-plans";
import { requireRestaurant } from "@/src/lib/auth";

export default async function BillingPage() {
  const restaurant = await requireRestaurant();

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5">
          <h1 className="text-xl font-semibold text-[var(--foreground)]">Période d&apos;essai terminée</h1>
          <p className="mt-2 text-sm text-[var(--foreground)]/75">
            Votre période d&apos;essai est terminée. Choisissez un abonnement pour continuer à utiliser ZenGrow.
          </p>
        </section>

        <BillingPlans
          status={restaurant.subscription_status}
          plan={restaurant.subscription_plan}
          trialEndDate={restaurant.trial_end_date}
        />
      </div>
    </main>
  );
}
