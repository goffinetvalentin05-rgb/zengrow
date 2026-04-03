import EmptyState from "@/src/components/ui/empty-state";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

type CustomerSummary = {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  reservations: number;
  lastVisit: string | null;
  totalVisits: number;
};

export default async function DashboardCustomersPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();

  const { data: customersData } = await supabase
    .from("customers")
    .select("id, full_name, phone, email, reservation_count, total_visits, last_visit_at")
    .eq("restaurant_id", restaurant.id)
    .order("reservation_count", { ascending: false });

  const customers: CustomerSummary[] = (customersData ?? []).map((customer) => ({
    key: customer.id,
    name: customer.full_name,
    phone: customer.phone,
    email: customer.email,
    reservations: customer.reservation_count ?? 0,
    lastVisit: customer.last_visit_at,
    totalVisits: customer.total_visits ?? 0,
  }));

  return (
    <section className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface)] p-6 shadow-sm md:p-8">
      <header className="mb-8">
        <h2 className="dashboard-page-title">Clients</h2>
        <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
          Liste simple des clients et de leur historique de réservation.
        </p>
      </header>
      {customers.length === 0 ? (
        <EmptyState title="Aucun client pour le moment" description="Les profils se construisent depuis les réservations." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.07)]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[rgba(0,0,0,0.06)] bg-[var(--surface-muted)]/40 text-left text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider">Nom</th>
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider">Email</th>
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider">Téléphone</th>
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider">Réservations</th>
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider">Dernière visite</th>
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider">Visites totales</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.key} className="border-b border-[rgba(0,0,0,0.05)] last:border-0">
                  <td className="px-4 py-3.5 font-medium text-[var(--foreground)]">{customer.name}</td>
                  <td className="px-4 py-3.5 text-[var(--foreground)]/75">{customer.email || "—"}</td>
                  <td className="px-4 py-3.5 text-[var(--foreground)]/75">{customer.phone || "—"}</td>
                  <td className="px-4 py-3.5 text-[var(--foreground)]/75">{customer.reservations}</td>
                  <td className="px-4 py-3.5 text-[var(--foreground)]/75">
                    {customer.lastVisit ? customer.lastVisit.slice(0, 10) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-[var(--foreground)]/75">{customer.totalVisits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
