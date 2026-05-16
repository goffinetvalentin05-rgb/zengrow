import FeedbacksKpiSkeleton from "@/src/components/dashboard/feedbacks/header/feedbacks-kpi-skeleton";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

export default function FeedbacksLoading() {
  return (
    <DashboardContent>
      <section
        className="w-full min-w-0 space-y-6 pb-[max(1rem,env(safe-area-inset-bottom))] md:space-y-10"
        aria-busy
        aria-label="Chargement des feedbacks"
      >
        <div className="space-y-2">
          <div className="h-9 w-40 max-w-[70%] animate-pulse rounded-lg bg-zg-surface" />
          <div className="h-5 w-full max-w-md animate-pulse rounded-lg bg-zg-surface" />
        </div>
        <FeedbacksKpiSkeleton />
        <div className="h-[140px] w-full animate-pulse rounded-2xl bg-zg-surface" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-zg-surface" />
        <div className="space-y-2.5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-[120px] animate-pulse rounded-xl bg-zg-surface sm:h-[108px]" />
          ))}
        </div>
      </section>
    </DashboardContent>
  );
}
