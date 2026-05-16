import { ReservationsPage } from "@/src/components/dashboard/reservations";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import PageHeader from "@/src/components/dashboard/page-header";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { Plus } from "lucide-react";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import type { OpeningHours } from "@/src/lib/utils";

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
    .select(
      "terrace_enabled, terrace_capacity, terrace_label, auto_archive_reservations, reservation_duration, restaurant_capacity, opening_hours",
    )
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

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
      <ReservationsPage
        initialReservations={(reservations ?? []) as ReservationRow[]}
        initialShowManualForm={shouldOpenManualForm}
        terraceEnabled={resSettings?.terrace_enabled === true}
        showZoneUi={(resSettings?.terrace_capacity ?? 0) > 0}
        terraceLabel={resSettings?.terrace_label ?? "Terrasse"}
        autoArchiveReservations={resSettings?.auto_archive_reservations === true}
        reservationDurationMinutes={resSettings?.reservation_duration ?? 90}
        restaurantCapacity={resSettings?.restaurant_capacity ?? 40}
        openingHours={(resSettings?.opening_hours as OpeningHours | null | undefined) ?? null}
      />
    </DashboardContent>
  );
}
