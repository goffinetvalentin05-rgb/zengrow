import CustomersKpiSkeleton from "@/src/components/dashboard/customers/header/customers-kpi-skeleton";
import CustomersListSkeleton from "@/src/components/dashboard/customers/list/customers-list-skeleton";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

export default function CustomersLoading() {
  return (
    <DashboardContent>
      <section className="space-y-8 md:space-y-10" aria-busy aria-label="Chargement des clients">
        <div className="space-y-2">
          <div className="h-9 w-40 animate-pulse rounded-lg bg-zg-surface" />
          <div className="h-5 w-72 max-w-full animate-pulse rounded-lg bg-zg-surface" />
        </div>
        <CustomersKpiSkeleton />
        <div className="h-11 w-full max-w-xl animate-pulse rounded-xl bg-zg-surface" />
        <CustomersListSkeleton />
      </section>
    </DashboardContent>
  );
}
