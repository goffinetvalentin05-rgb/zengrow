import { headers } from "next/headers";
import { Suspense } from "react";
import { Copy, ExternalLink, Plus } from "lucide-react";
import {
  DashboardHomeMetrics,
  DashboardHomeMetricsSkeleton,
} from "@/src/components/dashboard/dashboard-home-metrics";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const publicLink = host ? `${protocol}://${host}/r/${restaurant.slug}` : `/r/${restaurant.slug}`;

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select("restaurant_capacity")
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  const restaurantCapacity = settings?.restaurant_capacity ?? 40;

  return (
    <DashboardContent>
      <PageHeader
        title="Vue d'ensemble"
        subtitle="Suivi de l'activité de ton restaurant"
        secondaryActions={[
          {
            kind: "external",
            href: publicLink,
            label: "Page publique",
            icon: <ExternalLink className="h-4 w-4" strokeWidth={2} />,
          },
          {
            kind: "copy",
            label: "Copier le lien",
            icon: <Copy className="h-4 w-4" strokeWidth={2} />,
            value: publicLink,
          },
        ]}
        primaryAction={{
          kind: "link",
          href: "/dashboard/reservations?new=1",
          label: "Nouvelle réservation",
          icon: <Plus className="h-4 w-4" strokeWidth={2} />,
        }}
      />

      <section aria-labelledby="dashboard-stats-heading" className="mt-2 space-y-4">
        <div className="sr-only">
          <h2 id="dashboard-stats-heading">Statistiques</h2>
        </div>
        <Suspense fallback={<DashboardHomeMetricsSkeleton />}>
          <DashboardHomeMetrics restaurantId={restaurant.id} restaurantCapacity={restaurantCapacity} />
        </Suspense>
      </section>
    </DashboardContent>
  );
}
