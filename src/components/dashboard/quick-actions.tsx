import Link from "next/link";

export default function QuickActions() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight text-zg-fg">Raccourcis</h2>
      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/reservations" className="text-sm font-semibold text-zg-teal hover:underline">
          Réservations
        </Link>
        <Link href="/dashboard/settings" className="text-sm font-semibold text-zg-fg/62 hover:text-zg-fg">
          Paramètres
        </Link>
      </div>
    </section>
  );
}
