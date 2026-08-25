import { Gift } from "lucide-react";
import { DashboardHomeMetrics } from "@/src/components/dashboard/dashboard-home-metrics";
import { requireRestaurant } from "@/src/lib/auth";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

export default async function DashboardPage() {
  await requireRestaurant();

  return (
    <DashboardContent>
      <PageHeader
        title="Tableau de bord"
        subtitle="Suivez vos bons cadeaux, vos ventes et votre base d’acheteurs."
        primaryAction={{
          kind: "link",
          href: "/dashboard/gift-vouchers",
          label: "Créer un bon",
          icon: <Gift className="h-4 w-4" strokeWidth={2} />,
        }}
      />

      <section aria-labelledby="dashboard-stats-heading" className="mt-2 space-y-4">
        <div className="sr-only">
          <h2 id="dashboard-stats-heading">Statistiques</h2>
        </div>
        <DashboardHomeMetrics />
      </section>
    </DashboardContent>
  );
}
