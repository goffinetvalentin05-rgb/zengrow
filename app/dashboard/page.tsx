import { Suspense } from "react";
import { UserPlus } from "lucide-react";
import {
  DashboardHomeMetrics,
  DashboardHomeMetricsSkeleton,
} from "@/src/components/dashboard/dashboard-home-metrics";
import { requireRestaurant } from "@/src/lib/auth";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

export default async function DashboardPage() {
  const restaurant = await requireRestaurant();

  return (
    <DashboardContent>
      <PageHeader
        title="Vue d'ensemble"
        subtitle="Suivez vos clients, les relances automatiques et les retours générés par ZenGrow."
        primaryAction={{
          kind: "link",
          href: "/dashboard/customers",
          label: "Ajouter un client",
          icon: <UserPlus className="h-4 w-4" strokeWidth={2} />,
        }}
      />

      <section aria-labelledby="dashboard-stats-heading" className="mt-2 space-y-4">
        <div className="sr-only">
          <h2 id="dashboard-stats-heading">Statistiques</h2>
        </div>
        <Suspense fallback={<DashboardHomeMetricsSkeleton />}>
          <DashboardHomeMetrics restaurantId={restaurant.id} />
        </Suspense>
      </section>
    </DashboardContent>
  );
}
