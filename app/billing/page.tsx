import { AppAmbientBackground } from "@/src/components/app/app-ambient-background";
import BillingPlans from "@/src/components/dashboard/billing-plans";
import { zgBody } from "@/components/zg-landing/fonts";
import { requireRestaurantSession } from "@/src/lib/auth";

export default async function BillingPage() {
  const { restaurant, access } = await requireRestaurantSession();

  return (
    <main
      className={`${zgBody.className} relative min-h-screen overflow-hidden bg-zg-app px-4 py-10 text-zg-fg md:px-6`}
    >
      <AppAmbientBackground />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6">
        <section className="zg-premium-card px-6 py-5">
          {access.isOwnerDev ? (
            <>
              <h1 className="font-[family-name:var(--font-zg-display)] text-xl font-bold tracking-tight text-zg-fg">
                Facturation
              </h1>
              <p className="mt-2 text-sm text-zg-text-secondary">
                Compte développeur : accès Pro permanent sans souscription.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-[family-name:var(--font-zg-display)] text-xl font-bold tracking-tight text-zg-fg">
                Période d&apos;essai terminée
              </h1>
              <p className="mt-2 text-sm text-zg-text-secondary">
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
