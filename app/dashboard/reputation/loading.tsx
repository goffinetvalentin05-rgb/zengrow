import FeedbacksKpiSkeleton from "@/src/components/dashboard/feedbacks/header/feedbacks-kpi-skeleton";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

export default function ReputationLoading() {
  return (
    <DashboardContent>
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-zg-surface-elevated" />
        <FeedbacksKpiSkeleton />
      </div>
    </DashboardContent>
  );
}
