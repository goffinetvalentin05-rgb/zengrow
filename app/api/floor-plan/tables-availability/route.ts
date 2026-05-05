import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

function isYmd(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function isHm(v: string) {
  return /^\d{2}:\d{2}$/.test(v);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const restaurantId = params.get("restaurantId") ?? "";
  const date = params.get("date") ?? "";
  const time = params.get("time") ?? "";
  const coversRaw = params.get("covers") ?? "";
  const zone = params.get("zone") ?? "interior";

  const covers = Number(coversRaw);
  if (!restaurantId || !isYmd(date) || !isHm(time) || !Number.isFinite(covers) || covers <= 0) {
    return NextResponse.json({ tables: [], error: "Paramètres invalides." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: settings, error: settingsError } = await supabase
    .from("restaurant_settings")
    .select("use_tables, reservation_duration, floor_plan_clients_choose_table, terrace_enabled")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (settingsError || !settings) {
    return NextResponse.json({ tables: [], error: settingsError?.message ?? "Paramètres introuvables." }, { status: 500 });
  }

  if (!settings.floor_plan_clients_choose_table || settings.use_tables !== true) {
    return NextResponse.json({ tables: [], error: null }, { status: 200 });
  }

  // NB: le backend “Tables physiques” ne gère pas encore les tables en zone terrasse.
  // Pour ne pas casser le comportement existant, on force la sélection aux tables de salle intérieure.
  const reservationZone = zone === "terrace" ? "terrace" : "interior";
  if (reservationZone === "terrace") {
    return NextResponse.json({ tables: [], error: null }, { status: 200 });
  }

  const reservationDuration = settings.reservation_duration ?? 90;
  const targetStartMs = new Date(`${date}T${time}:00`).getTime();
  const targetEndMs = targetStartMs + reservationDuration * 60_000;

  const { data: zones } = await supabase
    .from("restaurant_zones")
    .select("id, name")
    .eq("restaurant_id", restaurantId);

  const tablesZoneFilter = new Set<string>();
  if (Array.isArray(zones) && zones.length > 0) {
    // Heuristique : on autorise les tables dont le nom de zone n'inclut pas “terrasse” quand on est en intérieur.
    for (const z of zones) {
      const name = (z.name ?? "").toLowerCase();
      if (!name.includes("terrasse")) tablesZoneFilter.add(z.id);
    }
  }

  const { data: tablesData, error: tablesError } = await supabase
    .from("restaurant_tables")
    .select("id, name, min_covers, max_covers, status, note, shape, x_position, y_position, width, height, rotation, zone_id")
    .eq("restaurant_id", restaurantId);

  if (tablesError || !tablesData) {
    return NextResponse.json({ tables: [], error: tablesError?.message ?? "Impossible de charger les tables." }, { status: 500 });
  }

  // Chargement des réservations du jour (pour détecter les conflits sur les tables).
  const { data: reservationsData, error: reservationsError } = await supabase
    .from("reservations")
    .select("id, reservation_time, guests, status, table_id, zone")
    .eq("restaurant_id", restaurantId)
    .eq("reservation_date", date)
    .in("status", ["pending", "confirmed"])
    .not("table_id", "is", null);

  if (reservationsError || !reservationsData) {
    return NextResponse.json({ tables: [], error: reservationsError?.message ?? "Impossible de charger les réservations." }, { status: 500 });
  }

  const reservedByTable = new Map<
    string,
    { reservationId: string; reservationStatus: string; guestCount: number | null; reservationTime: string }
  >();

  for (const r of reservationsData) {
    if (!r.table_id || !r.reservation_time) continue;
    const startMs = new Date(`${date}T${r.reservation_time}:00`).getTime();
    const endMs = startMs + reservationDuration * 60_000;
    const overlaps = startMs < targetEndMs && endMs > targetStartMs;
    if (!overlaps) continue;

    // Une table peut avoir plusieurs réservations qui se chevauchent (cas limite). On conserve la dernière.
    reservedByTable.set(r.table_id, {
      reservationId: r.id,
      reservationStatus: r.status ?? "pending",
      guestCount: r.guests ?? null,
      reservationTime: r.reservation_time,
    });
  }

  const tables = tablesData.map((t) => {
    const withinCapacity = t.min_covers <= covers && t.max_covers >= covers;
    const inZone =
      tablesZoneFilter.size === 0 ? true : t.zone_id ? tablesZoneFilter.has(t.zone_id) : true;

    const reserved = reservedByTable.has(t.id);
    const reservedMeta = reservedByTable.get(t.id) ?? null;

    const isSelectable =
      t.status === "active" && withinCapacity && inZone && !reserved;

    const isReserved = reserved;

    return {
      id: t.id,
      name: t.name,
      min_covers: t.min_covers,
      max_covers: t.max_covers,
      status: t.status,
      note: t.note,
      shape: t.shape,
      x_position: t.x_position,
      y_position: t.y_position,
      width: t.width,
      height: t.height,
      rotation: t.rotation,
      withinCapacity,
      inZone,
      reserved: isReserved,
      isSelectable,
      reservedMeta,
    };
  });

  return NextResponse.json({ tables });
}

