import Link from "next/link";
import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import FloorPlanVisualPanel from "@/src/components/dashboard/floor-plan-visual-panel";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { buttonClassName } from "@/src/components/ui/button";

export default async function DashboardFloorPlanPage() {
  const supabase = await createClient();
  const { restaurant, access } = await requireRestaurantSession();

  const hasAccess = access.canUseProFeatures;

  if (!hasAccess) {
    return (
      <DashboardContent width="wide">
        <section className="relative space-y-6">
          <PageHeader
            title="Plan de salle"
            subtitle="Créez vos espaces, placez vos tables et suivez votre service."
          />

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
                <p className="mt-3 text-sm leading-relaxed text-zg-text-secondary">
                  Zones, tables, assignation intelligente et vue du service du jour — tout au même endroit.
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

  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select(
      "floor_plan_auto_assign, floor_plan_lunch_duration, floor_plan_dinner_duration, reservation_duration, service_lunch_start, service_dinner_start"
    )
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  return (
    <DashboardContent width="wide">
      <FloorPlanVisualPanel
        restaurantId={restaurant.id}
        defaultLunchDurationMinutes={settings?.floor_plan_lunch_duration ?? settings?.reservation_duration ?? 90}
        defaultDinnerDurationMinutes={settings?.floor_plan_dinner_duration ?? settings?.reservation_duration ?? 90}
        lunchStartTime={settings?.service_lunch_start ?? null}
        dinnerStartTime={settings?.service_dinner_start ?? null}
      />
    </DashboardContent>
  );
}

