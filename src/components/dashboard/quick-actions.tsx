import Link from "next/link";

export default function QuickActions() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">Actions rapides</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/dashboard/reservations"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Gérer les réservations
        </Link>
        <Link
          href="/dashboard/settings"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Modifier les paramètres
        </Link>
      </div>
    </section>
  );
}
