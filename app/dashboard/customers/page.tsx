import { Users } from "lucide-react";
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
    <section className="space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
          <Users size={22} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="dashboard-page-title">Vos clients</h1>
          <p className="dashboard-section-subtitle mt-2 max-w-xl">
            Historique simple et lisible : idéal pour reconnaître vos habitués.
          </p>
        </div>
      </div>

      <div className="dashboard-shell-card overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-10 md:p-14">
            <EmptyState title="Aucun client pour le moment" description="Les fiches se construisent à partir des réservations." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)]/50 text-left">
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
      </div>
    </section>
  );
}
