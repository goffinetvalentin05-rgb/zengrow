import BillingPlans from "@/src/components/dashboard/billing-plans";
import { requireRestaurantSession } from "@/src/lib/auth";

export default async function BillingPage() {
  const { restaurant, access } = await requireRestaurantSession();

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5">
          {access.isOwnerDev ? (
            <>
              <h1 className="text-xl font-semibold text-[var(--foreground)]">Facturation</h1>
              <p className="mt-2 text-sm text-[var(--foreground)]/75">
                Compte développeur : accès Pro permanent sans souscription.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-[var(--foreground)]">Période d&apos;essai terminée</h1>
              <p className="mt-2 text-sm text-[var(--foreground)]/75">
                Votre période d&apos;essai est terminée. Choisissez un abonnement pour continuer à utiliser ZenGrow.
              </p>
            </>
          )}
        </section>

        <BillingPlans
          status={access.effectiveStatus}
          plan={access.effectivePlan}
          trialEndDate={restaurant.trial_end_date}
          isOwnerDev={access.isOwnerDev}
        />
      </div>
    </main>
  );
}
