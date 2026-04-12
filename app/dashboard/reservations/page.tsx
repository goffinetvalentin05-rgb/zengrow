import ReservationsManager from "@/src/components/dashboard/reservations-manager";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

type DashboardReservationsPageProps = {
  searchParams?: Promise<{ new?: string }>;
};

export default async function DashboardReservationsPage({ searchParams }: DashboardReservationsPageProps) {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();
  const params = searchParams ? await searchParams : undefined;
  const shouldOpenManualForm = params?.new === "1";

  const { data: reservations } = await supabase
    .from("reservations")
    .select(
      "id, reservation_date, reservation_time, guest_name, guest_phone, guest_email, guests, status, internal_note, created_at, zone",
    )
    .eq("restaurant_id", restaurant.id)
    .order("reservation_date", { ascending: false })
    .order("reservation_time", { ascending: false });

  const { data: resSettings } = await supabase
    .from("restaurant_settings")
    .select("terrace_enabled")
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  type ReservationRow = {
    id: string;
    reservation_date: string;
    reservation_time: string;
    guest_name: string;
    guest_phone: string | null;
    guest_email: string | null;
    guests: number;
    status: "pending" | "confirmed" | "refused" | "cancelled" | "completed" | "no-show";
    internal_note: string | null;
    created_at: string;
    zone?: "interior" | "terrace" | string | null;
  };

  return (
    <div className="space-y-10">
      <header className="border-b border-gray-100 pb-6">
        <h1 className="dashboard-section-heading">Réservations</h1>
        <p className="dashboard-section-subtitle mt-2 max-w-2xl">
          Filtrez la liste, ouvrez une fiche pour confirmer, refuser ou ajouter une note interne.
        </p>
      </header>
      <ReservationsManager
        initialReservations={(reservations ?? []) as ReservationRow[]}
        initialShowManualForm={shouldOpenManualForm}
        terraceEnabled={resSettings?.terrace_enabled === true}
      />
    </div>
  );
}
