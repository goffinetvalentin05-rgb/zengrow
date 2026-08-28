import { Gift, Sparkles, Ticket, Users } from "lucide-react";
import DashboardLoyaltyHighlightCard from "@/src/components/dashboard/dashboard-inactive-clients-card";
import StatCard, { StatCardSkeleton } from "@/src/components/dashboard/stat-card";
import { LoyaltyServiceError } from "@/src/lib/loyalty/errors";
import { formatPoints } from "@/src/lib/loyalty/points";
import { getLoyaltyKpis } from "@/src/lib/loyalty/service";
import { createClient } from "@/src/lib/supabase/server";

export function DashboardHomeMetricsSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 row-span-2 min-h-[240px] lg:col-span-4">
        <div className="h-full min-h-[220px] animate-pulse rounded-2xl bg-zg-surface" />
      </div>
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-2 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export async function DashboardHomeMetrics({ restaurantId }: { restaurantId: string }) {
  const supabase = await createClient();
  let kpis = {
    cardCount: 0,
    activeCount: 0,
    pointsInCirculation: 0,
    pointsAwarded: 0,
    rewardsRedeemed: 0,
    visitCount: 0,
  };

  try {
    kpis = await getLoyaltyKpis(supabase, restaurantId);
  } catch (error) {
    if (!(error instanceof LoyaltyServiceError)) throw error;
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 row-span-2 lg:col-span-4">
        <DashboardLoyaltyHighlightCard
          className="h-full min-h-[240px]"
          pointsInCirculation={kpis.pointsInCirculation}
          activeCount={kpis.activeCount}
        />
      </div>
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-2">
        <StatCard label="Clients fidèles" value={kpis.cardCount} icon={Users} dataTone="accent" trend="—" trendTone="muted" />
        <StatCard
          label="Points attribués"
          value={formatPoints(kpis.pointsAwarded)}
          icon={Sparkles}
          dataTone="premium"
          trend="—"
          trendTone="muted"
        />
        <StatCard
          label="Récompenses utilisées"
          value={kpis.rewardsRedeemed}
          icon={Gift}
          dataTone="info"
          trend="—"
          trendTone="muted"
        />
        <StatCard label="Visites enregistrées" value={kpis.visitCount} icon={Ticket} dataTone="success" trend="—" trendTone="muted" />
      </div>
    </div>
  );
}
