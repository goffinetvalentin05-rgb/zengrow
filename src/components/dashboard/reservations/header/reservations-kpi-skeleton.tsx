import { StatCardSkeleton } from "@/src/components/dashboard/stat-card";

export default function ReservationsKpiSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-busy
      aria-label="Chargement des indicateurs"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
