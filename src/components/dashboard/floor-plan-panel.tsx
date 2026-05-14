"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";

type ZoneRow = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

type TableRow = {
  id: string;
  name: string;
  min_covers: number;
  max_covers: number;
  zone_id: string | null;
  status: "active" | "inactive" | "blocked" | string;
  note: string | null;
};

type ReservationRow = {
  id: string;
  guest_name: string | null;
  guests: number | null;
  reservation_time: string | null;
  status: string | null;
  table_id: string | null;
};

type FloorPlanPanelProps = {
  restaurantId: string;
  defaultLunchDurationMinutes: number;
  defaultDinnerDurationMinutes: number;
  autoAssignEnabled: boolean;
};

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function FloorPlanPanel({
  restaurantId,
  defaultLunchDurationMinutes,
  defaultDinnerDurationMinutes,
  autoAssignEnabled,
}: FloorPlanPanelProps) {
  const supabase = useMemo(() => createClient(), []);

  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [serviceDate, setServiceDate] = useState(todayYmd());
  const [serviceFilter, setServiceFilter] = useState<"all" | "lunch" | "dinner">("all");

  const [showZoneForm, setShowZoneForm] = useState(false);
  const [zoneName, setZoneName] = useState("");
  const [zoneDescription, setZoneDescription] = useState("");
  const [zoneActive, setZoneActive] = useState(true);

  const [showTableForm, setShowTableForm] = useState(false);
  const [tableName, setTableName] = useState("");
  const [tableMin, setTableMin] = useState(2);
  const [tableMax, setTableMax] = useState(4);
  const [tableZoneId, setTableZoneId] = useState<string>("");
  const [tableStatus, setTableStatus] = useState<TableRow["status"]>("active");
  const [tableNote, setTableNote] = useState("");

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualGuestName, setManualGuestName] = useState("");
  const [manualGuestPhone, setManualGuestPhone] = useState("");
  const [manualGuestEmail, setManualGuestEmail] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [manualGuests, setManualGuests] = useState(2);
  const [manualNote, setManualNote] = useState("");

  const zoneById = useMemo(() => new Map(zones.map((z) => [z.id, z])), [zones]);
  const tableById = useMemo(() => new Map(tables.map((t) => [t.id, t])), [tables]);

  const groupedTables = useMemo(() => {
    const m = new Map<string, TableRow[]>();
    for (const t of tables) {
      const zid = t.zone_id ?? "none";
      const arr = m.get(zid) ?? [];
      arr.push(t);
      m.set(zid, arr);
    }
    for (const [, arr] of m) {
      arr.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    }
    return m;
  }, [tables]);

  const filteredReservations = useMemo(() => {
    if (serviceFilter === "all") return reservations;
    // Heuristique simple: midi < 16:00, soir >= 16:00
    return reservations.filter((r) => {
      const t = (r.reservation_time ?? "").slice(0, 5);
      const hour = Number(t.split(":")[0] ?? "0");
      return serviceFilter === "lunch" ? hour < 16 : hour >= 16;
    });
  }, [reservations, serviceFilter]);

  const reservationsToPlace = useMemo(
    () => filteredReservations.filter((r) => !r.table_id && (r.status === "pending" || r.status === "confirmed")),
    [filteredReservations],
  );

  const activeTables = useMemo(() => tables.filter((t) => t.status === "active"), [tables]);

  const availableCovers = useMemo(() => {
    return activeTables.reduce((sum, t) => sum + Math.max(0, t.max_covers ?? 0), 0);
  }, [activeTables]);

  const refreshAll = useCallback(async () => {
    setMessage(null);
    setLoading(true);

    const [{ data: zonesData, error: zonesError }, { data: tablesData, error: tablesError }] = await Promise.all([
      supabase
        .from("restaurant_zones")
        .select("id, name, description, is_active")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: true }),
      supabase
        .from("restaurant_tables")
        .select("id, name, min_covers, max_covers, zone_id, status, note")
        .eq("restaurant_id", restaurantId)
        .order("name", { ascending: true }),
    ]);

    if (zonesError || tablesError) {
      setMessage(zonesError?.message ?? tablesError?.message ?? "Impossible de charger le plan de salle.");
      setLoading(false);
      return;
    }

    setZones((zonesData ?? []) as ZoneRow[]);
    const nextTables = (tablesData ?? []) as TableRow[];
    setTables(nextTables);

    const firstZoneId = (zonesData?.[0]?.id as string | undefined) ?? "";
    setTableZoneId((current) => current || firstZoneId);

    setLoading(false);
  }, [restaurantId, supabase]);

  const refreshReservations = useCallback(
    async (date: string) => {
    setMessage(null);
    const { data, error } = await supabase
      .from("reservations")
      .select("id, guest_name, guests, reservation_time, status, table_id")
      .eq("restaurant_id", restaurantId)
      .eq("reservation_date", date)
      .order("reservation_time", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }
    setReservations((data ?? []) as ReservationRow[]);
    },
    [restaurantId, supabase],
  );

  /* eslint-disable react-hooks/set-state-in-effect -- chargement asynchrone des zones/tables et du service */
  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    void refreshReservations(serviceDate);
  }, [refreshReservations, serviceDate]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function createZone() {
    setMessage(null);
    const name = zoneName.trim();
    if (!name) {
      setMessage("Indiquez un nom de zone.");
      return;
    }
    const { error } = await supabase.from("restaurant_zones").insert({
      restaurant_id: restaurantId,
      name,
      description: zoneDescription.trim() || null,
      is_active: zoneActive,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setZoneName("");
    setZoneDescription("");
    setZoneActive(true);
    setShowZoneForm(false);
    await refreshAll();
  }

  async function createTable() {
    setMessage(null);
    const name = tableName.trim();
    if (!name) {
      setMessage("Indiquez un nom de table.");
      return;
    }
    const min_covers = Math.max(1, Math.floor(tableMin));
    const max_covers = Math.max(min_covers, Math.floor(tableMax));

    const { error } = await supabase.from("restaurant_tables").insert({
      restaurant_id: restaurantId,
      zone_id: tableZoneId || null,
      name,
      min_covers,
      max_covers,
      status: tableStatus,
      note: tableNote.trim() || null,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setTableName("");
    setTableMin(2);
    setTableMax(4);
    setTableStatus("active");
    setTableNote("");
    setShowTableForm(false);
    await refreshAll();
  }

  async function updateZoneActive(id: string, is_active: boolean) {
    setMessage(null);
    const { error } = await supabase
      .from("restaurant_zones")
      .update({ is_active })
      .eq("id", id)
      .eq("restaurant_id", restaurantId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setZones((cur) => cur.map((z) => (z.id === id ? { ...z, is_active } : z)));
  }

  async function deleteZone(id: string) {
    setMessage(null);
    const { error } = await supabase.from("restaurant_zones").delete().eq("id", id).eq("restaurant_id", restaurantId);
    if (error) {
      setMessage(error.message);
      return;
    }
    await refreshAll();
  }

  async function setTableStatusById(id: string, status: TableRow["status"]) {
    setMessage(null);
    const { error } = await supabase
      .from("restaurant_tables")
      .update({ status })
      .eq("id", id)
      .eq("restaurant_id", restaurantId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setTables((cur) => cur.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  async function deleteTable(id: string) {
    setMessage(null);
    const { error } = await supabase.from("restaurant_tables").delete().eq("id", id).eq("restaurant_id", restaurantId);
    if (error) {
      setMessage(error.message);
      return;
    }
    await refreshAll();
  }

  async function moveReservation(reservationId: string, nextTableId: string | null) {
    setMessage(null);
    const { error } = await supabase
      .from("reservations")
      .update({ table_id: nextTableId })
      .eq("id", reservationId)
      .eq("restaurant_id", restaurantId);
    if (error) {
      setMessage(error.message);
      return;
    }
    await refreshReservations(serviceDate);
  }

  async function createManualReservation() {
    setMessage(null);
    const name = manualGuestName.trim();
    const phone = manualGuestPhone.trim();
    const email = manualGuestEmail.trim();

    if (!serviceDate || !manualTime || !Number.isInteger(manualGuests) || manualGuests <= 0) {
      setMessage("Complétez date, heure et couverts.");
      return;
    }
    if (!name || !phone) {
      setMessage("Nom et téléphone sont requis.");
      return;
    }

    const response = await fetch("/api/reservations/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: name,
        guestPhone: phone,
        guestEmail: email || undefined,
        reservationDate: serviceDate,
        reservationTime: manualTime,
        guests: manualGuests,
        note: manualNote || undefined,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Impossible de créer la réservation.");
      return;
    }

    setShowManualForm(false);
    setManualGuestName("");
    setManualGuestPhone("");
    setManualGuestEmail("");
    setManualTime("");
    setManualGuests(2);
    setManualNote("");
    await refreshReservations(serviceDate);
  }

  const empty = zones.length === 0 && tables.length === 0;

  return (
    <section className="space-y-10">
      <header className="flex flex-col gap-5 border-b border-zg-border/80 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="dashboard-section-heading">Plan de salle</h1>
          <p className="dashboard-section-subtitle mt-2 max-w-2xl">
            Organisez vos tables, vos zones et vos réservations en un seul endroit.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => setShowTableForm(true)}>
            Ajouter une table
          </Button>
          <Button type="button" variant="secondary" onClick={() => setShowZoneForm(true)}>
            Ajouter une zone
          </Button>
          <Button type="button" onClick={() => setShowManualForm((v) => !v)}>
            Ajouter une réservation
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Tables actives</CardTitle>
            <CardDescription>Disponibles (hors bloquées)</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold tabular-nums text-zg-fg">{activeTables.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Couverts disponibles</CardTitle>
            <CardDescription>Somme max des tables actives</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold tabular-nums text-zg-fg">{availableCovers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Réservations aujourd’hui</CardTitle>
            <CardDescription>Pour la date sélectionnée</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold tabular-nums text-zg-fg">{reservations.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Réservations à placer</CardTitle>
            <CardDescription>Sans table assignée</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold tabular-nums text-zg-fg">{reservationsToPlace.length}</CardContent>
        </Card>
      </div>

      {message ? <p className="text-sm text-zg-muted">{message}</p> : null}

      {showZoneForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle zone</CardTitle>
            <CardDescription>Ex. Salle principale, Terrasse, Véranda…</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Nom</label>
              <Input value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder="Salle principale" />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Description (optionnelle)</label>
              <Textarea value={zoneDescription} onChange={(e) => setZoneDescription(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Toggle checked={zoneActive} onChange={setZoneActive} label="Zone active" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={createZone}>
                Créer la zone
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowZoneForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showTableForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle table</CardTitle>
            <CardDescription>Nom, capacité et zone</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Nom</label>
              <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="Table 1" />
            </div>
            <div>
              <label className="dashboard-field-label">Capacité min</label>
              <Input type="number" min={1} value={tableMin} onChange={(e) => setTableMin(Number(e.target.value))} />
            </div>
            <div>
              <label className="dashboard-field-label">Capacité max</label>
              <Input type="number" min={1} value={tableMax} onChange={(e) => setTableMax(Number(e.target.value))} />
            </div>
            <div>
              <label className="dashboard-field-label">Zone</label>
              <Select value={tableZoneId} onChange={(e) => setTableZoneId(e.target.value)}>
                <option value="">(Aucune)</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="dashboard-field-label">Statut</label>
              <Select value={tableStatus} onChange={(e) => setTableStatus(e.target.value as TableRow["status"])}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Bloquée</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Note (optionnelle)</label>
              <Textarea value={tableNote} onChange={(e) => setTableNote(e.target.value)} placeholder="Près de la fenêtre…" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={createTable}>
                Créer la table
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowTableForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showManualForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter une réservation</CardTitle>
            <CardDescription>
              Utile si toutes les réservations ne viennent pas du formulaire public. En mode tables physiques, si aucune table
              n’est disponible, la réservation peut être créée “À placer”.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="dashboard-field-label">Nom</label>
              <Input value={manualGuestName} onChange={(e) => setManualGuestName(e.target.value)} />
            </div>
            <div>
              <label className="dashboard-field-label">Téléphone</label>
              <Input value={manualGuestPhone} onChange={(e) => setManualGuestPhone(e.target.value)} />
            </div>
            <div>
              <label className="dashboard-field-label">E-mail (optionnel)</label>
              <Input type="email" value={manualGuestEmail} onChange={(e) => setManualGuestEmail(e.target.value)} />
            </div>
            <div>
              <label className="dashboard-field-label">Heure</label>
              <Input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} />
            </div>
            <div>
              <label className="dashboard-field-label">Couverts</label>
              <Input type="number" min={1} value={manualGuests} onChange={(e) => setManualGuests(Number(e.target.value))} />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Note interne</label>
              <Textarea value={manualNote} onChange={(e) => setManualNote(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Button type="button" onClick={createManualReservation}>
                Enregistrer
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowManualForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Chargement…</CardTitle>
              <CardDescription>Zones et tables</CardDescription>
            </CardHeader>
            <CardContent className="h-24">
              <div className="h-24 rounded-xl bg-zg-highlight/35 animate-pulse" aria-hidden />
              <span className="sr-only">Chargement des zones et tables</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Chargement…</CardTitle>
              <CardDescription>Service du jour</CardDescription>
            </CardHeader>
            <CardContent className="h-24">
              <div className="h-24 rounded-xl bg-zg-highlight/35 animate-pulse" aria-hidden />
              <span className="sr-only">Chargement du service du jour</span>
            </CardContent>
          </Card>
        </div>
      ) : empty ? (
        <Card>
          <CardHeader>
            <CardTitle>Commencez votre plan de salle</CardTitle>
            <CardDescription>
              Commencez par créer vos zones et vos tables pour activer le plan de salle intelligent.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => setShowZoneForm(true)}>
              Créer ma première zone
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowTableForm(true)}>
              Ajouter une table
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <Card>
            <CardHeader>
              <CardTitle>Zones & tables</CardTitle>
              <CardDescription>
                Statuts: active / inactive / bloquée. Les tables bloquées ne sont pas proposées par l’assignation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {zones.length === 0 ? (
                <EmptyState title="Aucune zone" description="Créez d’abord une zone." />
              ) : (
                <div className="space-y-5">
                  {zones.map((z) => {
                    const zTables = groupedTables.get(z.id) ?? [];
                    return (
                      <div key={z.id} className="rounded-2xl border border-zg-border bg-zg-surface p-4 transition-all duration-200 ease-out">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-zg-fg">{z.name}</p>
                            {z.description ? <p className="mt-1 text-sm text-zg-muted">{z.description}</p> : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <Toggle
                              checked={z.is_active}
                              onChange={(next) => updateZoneActive(z.id, next)}
                              label={z.is_active ? "Active" : "Inactive"}
                            />
                            <Button type="button" variant="danger" onClick={() => deleteZone(z.id)}>
                              Supprimer
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {zTables.length === 0 ? (
                            <p className="text-sm text-zg-muted">Aucune table dans cette zone.</p>
                          ) : (
                            zTables.map((t) => (
                              <div
                                key={t.id}
                                className="flex flex-col gap-3 rounded-2xl border border-zg-border/70 bg-zg-surface-elevated/60 p-4 md:flex-row md:items-center md:justify-between"
                              >
                                <div className="min-w-0">
                                  <p className="font-semibold text-zg-fg">
                                    {t.name}{" "}
                                    <span className="font-normal text-zg-muted">
                                      · {t.min_covers} à {t.max_covers} pers.
                                    </span>
                                  </p>
                                  {t.note ? <p className="mt-1 text-sm text-zg-muted">{t.note}</p> : null}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setTableStatusById(t.id, t.status === "blocked" ? "active" : "blocked")}
                                  >
                                    {t.status === "blocked" ? "Libérer" : "Bloquer"}
                                  </Button>
                                  <Button type="button" variant="secondary" onClick={() => setTableStatusById(t.id, "inactive")}>
                                    Inactiver
                                  </Button>
                                  <Button type="button" variant="danger" onClick={() => deleteTable(t.id)}>
                                    Supprimer
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Vue du service</CardTitle>
                <CardDescription>
                  Durées par défaut: midi {defaultLunchDurationMinutes} min · soir {defaultDinnerDurationMinutes} min ·{" "}
                  assignation auto {autoAssignEnabled ? "activée" : "désactivée"}.
                </CardDescription>
              </div>
              <div className="grid w-full gap-3 sm:max-w-[340px]">
                <div>
                  <label className="dashboard-field-label">Date</label>
                  <Input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} />
                </div>
                <div>
                  <label className="dashboard-field-label">Filtre</label>
                  <Select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value as typeof serviceFilter)}>
                    <option value="all">Journée complète</option>
                    <option value="lunch">Midi</option>
                    <option value="dinner">Soir</option>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {filteredReservations.length === 0 ? (
                <EmptyState title="Aucune réservation" description="Aucune réservation pour cette date." />
              ) : (
                <div className="space-y-3">
                  {filteredReservations.map((r) => {
                    const assignedTable = r.table_id ? tableById.get(r.table_id) ?? null : null;
                    const zone =
                      assignedTable?.zone_id ? (zoneById.get(assignedTable.zone_id) ?? null) : null;
                    const tableLabel = assignedTable ? `${assignedTable.name}${zone ? ` · ${zone.name}` : ""}` : "À placer";
                    const isUnassigned = !assignedTable;
                    return (
                      <div
                        key={r.id}
                        className="flex flex-col gap-3 rounded-2xl border border-zg-border bg-zg-surface p-4 transition-all duration-200 ease-out md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-zg-fg">
                            <span className="tabular-nums text-zg-teal">{(r.reservation_time ?? "--:--").slice(0, 5)}</span>{" "}
                            — {r.guest_name ?? "Client"} — {r.guests ?? "-"} pers. —{" "}
                            <span className={isUnassigned ? "text-zg-warning" : ""}>{tableLabel}</span>
                          </p>
                          <p className="mt-1 text-sm text-zg-muted">Statut: {r.status ?? "-"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Select
                            value={r.table_id ?? ""}
                            onChange={(e) => moveReservation(r.id, e.target.value ? e.target.value : null)}
                          >
                            <option value="">À placer</option>
                            {activeTables.map((t) => {
                              const z = t.zone_id ? zoneById.get(t.zone_id) ?? null : null;
                              return (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                  {z ? ` · ${z.name}` : ""}
                                </option>
                              );
                            })}
                          </Select>
                          {r.table_id ? (
                            <Button type="button" variant="secondary" onClick={() => moveReservation(r.id, null)}>
                              Retirer la table
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}

