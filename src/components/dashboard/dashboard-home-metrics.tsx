import { Gift, Receipt, Ticket, Users } from "lucide-react";
import DashboardGiftCardsHighlightCard from "@/src/components/dashboard/dashboard-inactive-clients-card";
import StatCard, { StatCardSkeleton } from "@/src/components/dashboard/stat-card";

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

export function DashboardHomeMetrics() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 row-span-2 lg:col-span-4">
        <DashboardGiftCardsHighlightCard className="h-full min-h-[240px]" />
      </div>
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-2">
        <StatCard label="Bons vendus" value={24} icon={Gift} dataTone="accent" trend="—" trendTone="muted" />
        <StatCard
          label="Chiffre d’affaires généré"
          value="2’850 CHF"
          icon={Receipt}
          dataTone="premium"
          trend="—"
          trendTone="muted"
        />
        <StatCard label="Bons utilisés" value={11} icon={Ticket} dataTone="info" trend="—" trendTone="muted" />
        <StatCard
          label="Clients enregistrés"
          value={19}
          icon={Users}
          dataTone="success"
          trend="—"
          trendTone="muted"
        />
      </div>
    </div>
  );
}
