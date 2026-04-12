import Link from "next/link";
import CustomersPanel, { type CustomerRow } from "@/src/components/dashboard/customers-panel";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

export default async function DashboardCustomersPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();
  const hasCustomersProAccess =
    restaurant.subscription_status === "trial" || restaurant.subscription_plan === "pro";

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
      <section className="relative space-y-6">
        <header className="border-b border-gray-100 pb-6">
          <h1 className="dashboard-section-heading">Clients</h1>
          <p className="dashboard-section-subtitle mt-2 max-w-xl">
            Fiches construites à partir des réservations — idéal pour reconnaître vos habitués.
          </p>
        </header>

        <div className="relative min-h-[min(70vh,560px)] overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/90 to-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100/40 via-transparent to-transparent opacity-90"
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
            <div className="max-w-md rounded-2xl border border-gray-200/80 bg-white/95 px-8 py-10 shadow-lg backdrop-blur-sm">
              <p className="text-base font-medium leading-relaxed text-gray-900">
                Cette fonctionnalité est disponible dans le plan Pro (69 CHF/mois)
              </p>
              <Link
                href="/dashboard/billing"
                className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-800"
              >
                Passer au plan Pro
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      <header className="border-b border-gray-100 pb-6">
        <h1 className="dashboard-section-heading">Clients</h1>
        <p className="dashboard-section-subtitle mt-2 max-w-xl">
          Fiches construites à partir des réservations — idéal pour reconnaître vos habitués.
        </p>
      </header>

      <CustomersPanel customers={customers} />
    </section>
  );
}
