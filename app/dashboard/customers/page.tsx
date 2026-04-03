import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
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
      <header className="border-b border-gray-100 pb-6">
        <h1 className="dashboard-section-heading">Clients</h1>
        <p className="dashboard-section-subtitle mt-2 max-w-xl">
          Fiches construites à partir des réservations — idéal pour reconnaître vos habitués.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>Historique et fréquentation.</CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <EmptyState title="Aucun client" description="Les fiches apparaîtront après des réservations." />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/90 text-left">
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Nom</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Téléphone</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Résa.</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Dernière visite</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Visites</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.key} className="border-b border-gray-100 bg-white last:border-0 hover:bg-gray-50/60">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{customer.name}</td>
                      <td className="px-5 py-3.5 text-gray-600">{customer.email || "—"}</td>
                      <td className="px-5 py-3.5 text-gray-600">{customer.phone || "—"}</td>
                      <td className="px-5 py-3.5 tabular-nums text-gray-600">{customer.reservations}</td>
                      <td className="px-5 py-3.5 tabular-nums text-gray-600">
                        {customer.lastVisit ? customer.lastVisit.slice(0, 10) : "—"}
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-gray-600">{customer.totalVisits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
