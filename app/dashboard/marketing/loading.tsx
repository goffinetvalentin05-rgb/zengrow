import MarketingKpiSkeleton from "@/src/components/dashboard/marketing/header/marketing-kpi-skeleton";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

export default function MarketingLoading() {
  return (
    <DashboardContent>
      <section className="space-y-8 md:space-y-10" aria-busy aria-label="Chargement du marketing">
        <div className="space-y-2">
          <div className="h-9 w-36 animate-pulse rounded-lg bg-zg-surface" />
          <div className="h-5 w-full max-w-md animate-pulse rounded-lg bg-zg-surface" />
        </div>
        <MarketingKpiSkeleton />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-zg-surface" />
          ))}
        </div>
      </section>
    </DashboardContent>
  );
}
