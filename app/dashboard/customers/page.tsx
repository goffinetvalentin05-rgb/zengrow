import Link from "next/link";
import CustomersPanel, { type CustomerRow } from "@/src/components/dashboard/customers-panel";
import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

export default async function DashboardCustomersPage() {
  const supabase = await createClient();
  const { restaurant, access } = await requireRestaurantSession();
  const hasCustomersProAccess = access.canUseProFeatures;

  const { data: customersData } = await supabase
    .from("customers")
    .select("id, full_name, phone, email, reservation_count, total_visits, last_visit_at")
    .eq("restaurant_id", restaurant.id)
    .order("reservation_count", { ascending: false });

  const { data: completedReservations } = await supabase
    .from("reservations")
    .select("customer_id, guests")
    .eq("restaurant_id", restaurant.id)
    .eq("status", "completed")
    .neq("reservation_type", "walkin")
    .not("customer_id", "is", null);

  const avgByCustomer = new Map<string, { sum: number; count: number }>();
  for (const row of completedReservations ?? []) {
    const id = row.customer_id as string;
    const g = row.guests ?? 0;
    const cur = avgByCustomer.get(id) ?? { sum: 0, count: 0 };
    cur.sum += g;
    cur.count += 1;
    avgByCustomer.set(id, cur);
  }

  const customers: CustomerRow[] = (customersData ?? [])
    .map((customer) => {
      const agg = avgByCustomer.get(customer.id);
      const avgCovers =
        agg && agg.count > 0 ? Math.round((agg.sum / agg.count) * 10) / 10 : null;
      return {
        id: customer.id,
        name: customer.full_name,
        phone: customer.phone,
        email: customer.email,
        reservations: customer.reservation_count ?? 0,
        lastVisit: customer.last_visit_at,
        totalVisits: customer.total_visits ?? 0,
        avgCovers,
      };
    })
    .filter(
      (c) =>
        c.reservations > 0 ||
        c.totalVisits > 0 ||
        (c.email != null && c.email.trim().length > 0) ||
        (c.phone != null && c.phone.trim().length > 0),
    );

  if (!hasCustomersProAccess) {
    return (
      <DashboardContent>
        <section className="relative space-y-6">
          <PageHeader
            kicker="Clients"
            title="Clients"
            subtitle="Fiches construites à partir des réservations — idéal pour reconnaître vos habitués."
          />

          <div className="relative min-h-[min(70vh,560px)] overflow-hidden rounded-[1.35rem] border border-zg-border bg-gradient-to-b from-zg-surface-soft to-zg-surface shadow-zg-card">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zg-highlight/50 via-transparent to-transparent opacity-90"
            />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
              <div className="max-w-md rounded-2xl border border-zg-border bg-zg-surface px-8 py-10 shadow-zg-sidebar">
                <p className="text-base font-semibold leading-relaxed text-zg-fg">
                  Cette fonctionnalité est disponible dans le plan Pro (69 CHF/mois)
                </p>
                <Link
                  href="/dashboard/settings?section=subscription"
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-zg-teal to-zg-mint px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_-14px_rgba(232,93,44,0.42)] transition hover:scale-[1.02] active:scale-[0.99]"
                >
                  Passer au plan Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <section className="space-y-10">
        <PageHeader
          kicker="Clients"
          title="Clients"
          subtitle="Fiches construites à partir des réservations — idéal pour reconnaître vos habitués."
        />

        <CustomersPanel customers={customers} />
      </section>
    </DashboardContent>
  );
}
