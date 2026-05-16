import { StatCardSkeleton } from "@/src/components/dashboard/stat-card";

export default function ReservationsKpiSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
      aria-busy
      aria-label="Chargement des indicateurs"
    >
      {Array.from({ length: 3 }, (_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
