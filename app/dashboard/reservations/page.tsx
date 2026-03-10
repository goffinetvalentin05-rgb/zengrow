import ReservationsManager from "@/src/components/dashboard/reservations-manager";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

export default async function DashboardReservationsPage() {
  const supabase = await createClient();
  const restaurant = await requireRestaurant();

  const { data: reservations } = await supabase
    .from("reservations")
    .select(
      "id, reservation_date, reservation_time, guest_name, guest_phone, guest_email, guests, status, internal_note, created_at",
    )
    .eq("restaurant_id", restaurant.id)
    .order("reservation_date", { ascending: false })
    .order("reservation_time", { ascending: false });

  type ReservationRow = {
    id: string;
    reservation_date: string;
    reservation_time: string;
    guest_name: string;
    guest_phone: string | null;
    guest_email: string | null;
    guests: number;
    status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed" | "no-show";
    internal_note: string | null;
    created_at: string;
  };

  return (
    <ReservationsManager initialReservations={(reservations ?? []) as ReservationRow[]} />
  );
}
