import ReservationsManager from "@/src/components/dashboard/reservations-manager";
import PageHeader from "@/src/components/dashboard/page-header";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { Plus } from "lucide-react";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { TerraceControlBanner } from "@/src/components/dashboard/terrace-control-banner";

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
      "id, reservation_date, reservation_time, guest_name, guest_phone, guest_email, guests, status, internal_note, created_at, zone, reservation_type",
    )
    .eq("restaurant_id", restaurant.id)
    .order("reservation_date", { ascending: true })
    .order("reservation_time", { ascending: true });

  const { data: resSettings } = await supabase
    .from("restaurant_settings")
    .select("terrace_enabled, terrace_capacity, terrace_label, auto_archive_reservations, reservation_duration")
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
    reservation_type?: "standard" | "walkin";
  };

  return (
    <DashboardContent>
      <PageHeader
        title="Réservations"
        subtitle="Gère tes réservations du jour et celles à venir."
        primaryAction={{
          kind: "link",
          href: "/dashboard/reservations?new=1",
          label: "Nouvelle réservation",
          icon: <Plus className="h-4 w-4" strokeWidth={2} />,
        }}
      />
      <TerraceControlBanner restaurantId={restaurant.id} className="mb-4" />
      <ReservationsManager
        initialReservations={(reservations ?? []) as ReservationRow[]}
        initialShowManualForm={shouldOpenManualForm}
        terraceEnabled={resSettings?.terrace_enabled === true}
        showZoneUi={(resSettings?.terrace_capacity ?? 0) > 0}
        terraceLabel={resSettings?.terrace_label ?? "Terrasse"}
        autoArchiveReservations={resSettings?.auto_archive_reservations === true}
        reservationDurationMinutes={resSettings?.reservation_duration ?? 90}
      />
    </DashboardContent>
  );
}
