import Link from "next/link";
import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import FloorPlanVisualPanel from "@/src/components/dashboard/floor-plan-visual-panel";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

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

          <div className="relative min-h-[min(70vh,560px)] overflow-hidden rounded-[1.35rem] border border-zg-border bg-gradient-to-b from-zg-surface-soft to-zg-surface shadow-zg-card">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zg-highlight/50 via-transparent to-transparent opacity-90"
            />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
              <div className="max-w-md rounded-2xl border border-zg-border bg-zg-surface px-8 py-10 shadow-zg-sidebar">
                <p className="text-base font-semibold leading-relaxed text-zg-fg">
                  Cette fonctionnalité est disponible dans le plan Pro (69 CHF/mois)
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zg-muted">
                  Zones, tables, assignation intelligente et vue du service du jour — tout au même endroit.
                </p>
                <Link
                  href="/dashboard/settings?section=subscription"
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-zg-teal to-zg-mint px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_-14px_rgba(232,93,44,0.42)] transition hover:scale-[1.02] active:scale-[0.99]"
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

