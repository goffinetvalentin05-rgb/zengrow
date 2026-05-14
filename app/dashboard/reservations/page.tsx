import ReservationsManager from "@/src/components/dashboard/reservations-manager";
import PageHeader from "@/src/components/dashboard/page-header";
import { requireRestaurant } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { Plus } from "lucide-react";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";

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
      "id, reservation_date, reservation_time, guest_name, guest_phone, guest_email, guests, status, internal_note, created_at, zone, reservation_type, table_id",
    )
    .eq("restaurant_id", restaurant.id)
    .order("reservation_date", { ascending: true })
    .order("reservation_time", { ascending: true });

  const [{ data: tablesData }, { data: zonesData }] = await Promise.all([
    supabase
      .from("restaurant_tables")
      .select("id, name, zone_id")
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("restaurant_zones")
      .select("id, name")
      .eq("restaurant_id", restaurant.id),
  ]);

  const zoneById = new Map<string, string>((zonesData ?? []).map((z) => [z.id, z.name]));
  const tableLabelById = new Map<string, string>(
    (tablesData ?? []).map((t) => {
      const zoneName = t.zone_id ? zoneById.get(t.zone_id) : null;
      return [t.id, zoneName ? `${t.name} · ${zoneName}` : t.name];
    }),
  );

  const { data: resSettings } = await supabase
    .from("restaurant_settings")
    .select("terrace_enabled, auto_archive_reservations, reservation_duration")
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
    table_id?: string | null;
    table_label?: string | null;
  };

  return (
    <DashboardContent>
      <PageHeader
        title="Réservations"
        subtitle={
          resSettings?.auto_archive_reservations !== true
            ? "Filtrez la liste, ouvrez une fiche pour confirmer, refuser ou ajouter une note interne. Les créneaux déjà passés restent affichés tant que l’archivage automatique est désactivé dans Paramètres."
            : "Filtrez la liste, ouvrez une fiche pour confirmer, refuser ou ajouter une note interne."
        }
        primaryAction={{
          kind: "link",
          href: "/dashboard/reservations?new=1",
          label: "Nouvelle réservation",
          icon: <Plus className="h-4 w-4" strokeWidth={2} />,
        }}
      />
      <ReservationsManager
        initialReservations={((reservations ?? []) as ReservationRow[]).map((r) => ({
          ...r,
          table_label: r.table_id ? tableLabelById.get(r.table_id) ?? null : null,
        }))}
        initialShowManualForm={shouldOpenManualForm}
        terraceEnabled={resSettings?.terrace_enabled === true}
        autoArchiveReservations={resSettings?.auto_archive_reservations === true}
        reservationDurationMinutes={resSettings?.reservation_duration ?? 90}
      />
    </DashboardContent>
  );
}
