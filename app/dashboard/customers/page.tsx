import Link from "next/link";
import GiftCardBuyersPage from "@/src/components/dashboard/customers/gift-card-buyers-page";
import { requireRestaurantSession } from "@/src/lib/auth";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { buttonClassName } from "@/src/components/ui/button";

export default async function DashboardCustomersPage() {
  const { access } = await requireRestaurantSession();
  const hasCustomersProAccess = access.canUseProFeatures;

  if (!hasCustomersProAccess) {
    return (
      <DashboardContent>
        <section className="relative space-y-6">
          <PageHeader title="Clients" subtitle="Les personnes qui ont acheté un bon cadeau dans votre établissement." />

          <div className="relative min-h-[min(70vh,560px)] overflow-hidden rounded-2xl border border-zg-border bg-zg-surface transition-all duration-200 ease-out">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,93,44,0.08),transparent_55%)]"
            />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
              <div className="max-w-md rounded-2xl border border-zg-border bg-zg-surface-elevated px-8 py-10">
                <p className="text-base font-semibold leading-relaxed text-zg-fg">
                  Cette fonctionnalité est disponible dans le plan Pro (69 CHF/mois)
                </p>
                <Link
                  href="/dashboard/settings?section=subscription"
                  className={buttonClassName({
                    variant: "primary",
                    size: "md",
                    className: "mt-6 w-full",
                  })}
                >
                  Passer au plan Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <GiftCardBuyersPage />
    </DashboardContent>
  );
}
