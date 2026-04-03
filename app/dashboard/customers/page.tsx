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
    <section className="space-y-10">
      <header className="space-y-2">
        <p className="dashboard-section-kicker">Base clients</p>
        <h1 className="dashboard-page-title">Vos clients</h1>
        <p className="dashboard-section-subtitle max-w-xl">
          Historique simple : reconnaître vos habitués au fil des réservations.
        </p>
      </header>

      {customers.length === 0 ? (
        <EmptyState title="Aucun client pour le moment" description="Les fiches se construisent à partir des réservations." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
                    Nom
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
                    Email
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
                    Téléphone
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
                    Réservations
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
                    Dernière visite
                  </th>
                  <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
                    Visites
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.key}
                    className="border-b border-[var(--border-soft)] transition-colors last:border-0 hover:bg-[var(--surface-muted)]/40"
                  >
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">{customer.name}</td>
                    <td className="px-6 py-4 text-[var(--foreground)]/80">{customer.email || "—"}</td>
                    <td className="px-6 py-4 text-[var(--foreground)]/80">{customer.phone || "—"}</td>
                    <td className="px-6 py-4 tabular-nums text-[var(--foreground)]/80">{customer.reservations}</td>
                    <td className="px-6 py-4 tabular-nums text-[var(--foreground)]/80">
                      {customer.lastVisit ? customer.lastVisit.slice(0, 10) : "—"}
                    </td>
                    <td className="px-6 py-4 tabular-nums text-[var(--foreground)]/80">{customer.totalVisits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </section>
  );
}
