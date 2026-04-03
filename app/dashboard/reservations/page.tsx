import { Calendar } from "lucide-react";
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
    <div className="space-y-10">
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[var(--primary)]">
          <Calendar size={22} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="dashboard-page-title">Réservations</h1>
          <p className="dashboard-section-subtitle mt-2 max-w-2xl">
            Toutes les demandes au même endroit : confirmez, refusez ou notez un détail en quelques clics.
          </p>
        </div>
      </div>
      <ReservationsManager
        initialReservations={(reservations ?? []) as ReservationRow[]}
        initialShowManualForm={shouldOpenManualForm}
      />
    </div>
  );
}
