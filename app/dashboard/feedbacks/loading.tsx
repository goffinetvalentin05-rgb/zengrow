import FeedbacksKpiSkeleton from "@/src/components/dashboard/feedbacks/header/feedbacks-kpi-skeleton";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

export default function FeedbacksLoading() {
  return (
    <DashboardContent>
      <section className="space-y-8 md:space-y-10" aria-busy aria-label="Chargement des feedbacks">
        <div className="space-y-2">
          <div className="h-9 w-40 animate-pulse rounded-lg bg-zg-surface" />
          <div className="h-5 w-80 max-w-full animate-pulse rounded-lg bg-zg-surface" />
        </div>
        <FeedbacksKpiSkeleton />
      </section>
    </DashboardContent>
  );
}
