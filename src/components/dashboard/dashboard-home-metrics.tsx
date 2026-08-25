import { Gift, Receipt, Ticket, Users } from "lucide-react";
import DashboardGiftCardsHighlightCard from "@/src/components/dashboard/dashboard-inactive-clients-card";
import StatCard, { StatCardSkeleton } from "@/src/components/dashboard/stat-card";
import { GiftVoucherServiceError, getGiftVoucherKpis } from "@/src/lib/gift-vouchers/service";
import { formatCentsAsChf } from "@/src/lib/gift-vouchers/money";
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
    soldCount: 0,
    revenueCents: 0,
    usedCount: 0,
    circulationCents: 0,
    activeCount: 0,
    buyerCount: 0,
  };

  try {
    kpis = await getGiftVoucherKpis(supabase, restaurantId);
  } catch (error) {
    if (!(error instanceof GiftVoucherServiceError)) throw error;
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 row-span-2 lg:col-span-4">
        <DashboardGiftCardsHighlightCard
          className="h-full min-h-[240px]"
          circulationCents={kpis.circulationCents}
          activeCount={kpis.activeCount}
        />
      </div>
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-2">
        <StatCard label="Bons vendus" value={kpis.soldCount} icon={Gift} dataTone="accent" trend="—" trendTone="muted" />
        <StatCard
          label="Chiffre d’affaires généré"
          value={formatCentsAsChf(kpis.revenueCents)}
          icon={Receipt}
          dataTone="premium"
          trend="—"
          trendTone="muted"
        />
        <StatCard label="Bons utilisés" value={kpis.usedCount} icon={Ticket} dataTone="info" trend="—" trendTone="muted" />
        <StatCard
          label="Clients enregistrés"
          value={kpis.buyerCount}
          icon={Users}
          dataTone="success"
          trend="—"
          trendTone="muted"
        />
      </div>
    </div>
  );
}
