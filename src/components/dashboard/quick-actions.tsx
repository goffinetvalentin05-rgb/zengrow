import Link from "next/link";

export default function QuickActions() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Raccourcis</h2>
      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/reservations" className="text-sm font-medium text-green-700 hover:underline">
          Réservations
        </Link>
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Paramètres
        </Link>
      </div>
    </section>
  );
}
