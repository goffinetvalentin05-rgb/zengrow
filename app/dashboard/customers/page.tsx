import Link from "next/link";
import { subMonths } from "date-fns";
import CustomersPage from "@/src/components/dashboard/customers/customers-page";
import type { CustomerRecord } from "@/src/components/dashboard/customers/types";
import {
  computeCustomerKpis,
  countCustomersCreatedBetween,
} from "@/src/components/dashboard/customers/utils/customer-kpis";
import { requireRestaurantSession } from "@/src/lib/auth";
import {
  endOfBusinessYmdAsUtcIso,
  monthBoundsInBusinessTz,
  startOfBusinessYmdAsUtcIso,
} from "@/src/lib/date/business-calendar";
import { createClient } from "@/src/lib/supabase/server";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { buttonClassName } from "@/src/components/ui/button";

function isDisplayableCustomer(row: {
  reservation_count: number | null;
  total_visits: number | null;
  email: string | null;
  phone: string | null;
}): boolean {
  return (
    (row.reservation_count ?? 0) > 0 ||
    (row.total_visits ?? 0) > 0 ||
    (row.email != null && row.email.trim().length > 0) ||
    (row.phone != null && row.phone.trim().length > 0)
  );
}

export default async function DashboardCustomersPage() {
  const supabase = await createClient();
  const { restaurant, access } = await requireRestaurantSession();
  const hasCustomersProAccess = access.canUseProFeatures;

  const { data: customersData } = await supabase
    .from("customers")
    .select(
      "id, full_name, phone, email, reservation_count, total_visits, last_visit_at, created_at",
    )
    .eq("restaurant_id", restaurant.id)
    .order("reservation_count", { ascending: false });

  const { data: completedReservations } = await supabase
    .from("reservations")
    .select("customer_id, guests")
    .eq("restaurant_id", restaurant.id)
    .eq("status", "completed")
    .neq("reservation_type", "walkin")
    .not("customer_id", "is", null);

  const { data: reservationDates } = await supabase
    .from("reservations")
    .select("customer_id, reservation_date")
    .eq("restaurant_id", restaurant.id)
    .not("customer_id", "is", null);

  const firstVisitByCustomer = new Map<string, string>();
  for (const row of reservationDates ?? []) {
    const id = row.customer_id as string;
    const ymd = row.reservation_date.trim().slice(0, 10);
    const current = firstVisitByCustomer.get(id);
    if (!current || ymd < current) {
      firstVisitByCustomer.set(id, ymd);
    }
  }

  const avgByCustomer = new Map<string, { sum: number; count: number }>();
  for (const row of completedReservations ?? []) {
    const id = row.customer_id as string;
    const g = row.guests ?? 0;
    const cur = avgByCustomer.get(id) ?? { sum: 0, count: 0 };
    cur.sum += g;
    cur.count += 1;
    avgByCustomer.set(id, cur);
  }

  const now = new Date();
  const currentMonth = monthBoundsInBusinessTz(now);
  const previousMonth = monthBoundsInBusinessTz(subMonths(now, 1));
  const currentMonthStart = startOfBusinessYmdAsUtcIso(currentMonth.startYmd);
  const currentMonthEnd = endOfBusinessYmdAsUtcIso(currentMonth.endYmd);
  const previousMonthStart = startOfBusinessYmdAsUtcIso(previousMonth.startYmd);
  const previousMonthEnd = endOfBusinessYmdAsUtcIso(previousMonth.endYmd);

  const displayableRows = (customersData ?? []).filter(isDisplayableCustomer);
  const createdAtRows = displayableRows.map((row) => ({
    createdAt: row.created_at,
  }));

  const newThisMonth = countCustomersCreatedBetween(
    createdAtRows,
    currentMonthStart,
    currentMonthEnd,
  );
  const newPreviousMonth = countCustomersCreatedBetween(
    createdAtRows,
    previousMonthStart,
    previousMonthEnd,
  );

  const customers: CustomerRecord[] = displayableRows.map((customer) => {
    const agg = avgByCustomer.get(customer.id);
    const avgCovers =
      agg && agg.count > 0 ? Math.round((agg.sum / agg.count) * 10) / 10 : null;
    return {
      id: customer.id,
      name: customer.full_name,
      phone: customer.phone,
      email: customer.email,
      reservationCount: customer.reservation_count ?? 0,
      lastVisitAt: customer.last_visit_at,
      firstVisitAt:
        firstVisitByCustomer.get(customer.id) ?? customer.created_at.slice(0, 10),
      totalVisits: customer.total_visits ?? 0,
      avgCovers,
    };
  });

  const kpis = computeCustomerKpis(customers, newThisMonth, newPreviousMonth);

  if (!hasCustomersProAccess) {
    return (
      <DashboardContent>
        <section className="relative space-y-6">
          <PageHeader
            title="Clients"
            subtitle="Vos habitués et nouveaux visiteurs"
          />

          <div className="relative min-h-[min(70vh,560px)] overflow-hidden rounded-2xl border border-zg-border bg-zg-surface transition-all duration-200 ease-out">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,93,44,0.08),transparent_55%)]"
            />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
              <div className="max-w-md rounded-2xl border border-zg-border bg-zg-surface-elevated px-8 py-10">
                <p className="text-base font-semibold leading-relaxed text-zg-fg">
                  Cette fonctionnalité est disponible dans le plan Pro (69 CHF/mois)
                </p>
                <Link
                  href="/dashboard/settings?section=subscription"
                  className={buttonClassName({
                    variant: "primary",
                    size: "md",
                    className: "mt-6 w-full",
                  })}
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
      <CustomersPage customers={customers} kpis={kpis} />
    </DashboardContent>
  );
}
