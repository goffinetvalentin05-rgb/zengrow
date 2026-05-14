"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import PageHeader from "@/src/components/dashboard/page-header";
import { cn } from "@/src/lib/utils";
import type { CSSProperties } from "react";

type FloorPlanTableShape = "round" | "square" | "rectangle";

type TableRow = {
  id: string;
  restaurant_id: string;
  floor_plan_id?: string | null;
  zone_id: string | null;
  name: string;
  min_covers: number;
  max_covers: number;
  status: "active" | "inactive" | "blocked" | string;
  note: string | null;
  // Layout
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  shape: FloorPlanTableShape;
  rotation: number;
};

type ReservationRow = {
  id: string;
  guest_name: string | null;
  guests: number | null;
  reservation_time: string | null;
  status: string | null;
  table_id: string | null;
  zone?: "interior" | "terrace" | string | null;
};

type FloorPlanElementType = "wall" | "door" | "window" | "zone" | "bar" | "label" | "other";

type FloorPlanElementRow = {
  id: string;
  restaurant_id: string;
  floor_plan_id?: string | null;
  type: FloorPlanElementType;
  label: string | null;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
  rotation: number;
  metadata: Record<string, unknown>;
};

type FloorPlanRow = {
  id: string;
  name: string;
  type: "indoor" | "terrace" | "custom" | string;
  is_active: boolean;
  sort_order: number;
};

type FloorPlanVisualPanelProps = {
  restaurantId: string;
  defaultLunchDurationMinutes: number;
  defaultDinnerDurationMinutes: number;
  lunchStartTime?: string | null;
  dinnerStartTime?: string | null;
};

function ymd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hmToMinutes(hm: string) {
  const [h, m] = hm.split(":");
  const hh = Number(h);
  const mm = Number(m);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0;
  return hh * 60 + mm;
}

function dateTimeMs(serviceDate: string, time: string) {
  return new Date(`${serviceDate}T${time}:00`).getTime();
}

function durationForStartTime(reservationTime: string | null, lunchDuration: number, dinnerDuration: number) {
  const t = (reservationTime ?? "").slice(0, 5);
  if (!t || t.length !== 5) return dinnerDuration;
  // Heuristique: lunch avant 16:00, dinner à partir de 16:00.
  return hmToMinutes(t) < 16 * 60 ? lunchDuration : dinnerDuration;
}

function shapeToStyle(shape: FloorPlanTableShape, width: number, height: number, rotation: number): CSSProperties {
  if (shape === "round") {
    return {
      width,
      height,
      borderRadius: Math.min(width, height) / 2,
      transform: `rotate(${rotation}deg)`,
    };
  }

  const radius = 14;
  if (shape === "square") {
    return {
      width,
      height: Math.max(height, 30),
      borderRadius: radius,
      transform: `rotate(${rotation}deg)`,
    };
  }

  // rectangle
  return {
    width,
    height: Math.max(height, 30),
    borderRadius: radius,
    transform: `rotate(${rotation}deg)`,
  };
}

export default function FloorPlanVisualPanel({
  restaurantId,
  defaultLunchDurationMinutes,
  defaultDinnerDurationMinutes,
  lunchStartTime,
  dinnerStartTime,
}: FloorPlanVisualPanelProps) {
  const supabase = useMemo(() => createClient(), []);

  const [mode, setMode] = useState<"edit" | "service">("edit");
  const [serviceDate, setServiceDate] = useState(() => ymd(new Date()));
  const [servicePeriod, setServicePeriod] = useState<"lunch" | "dinner">("dinner");
  const [serviceTime, setServiceTime] = useState<string>(() => (dinnerStartTime ?? "19:00").slice(0, 5));

  const [tables, setTables] = useState<TableRow[]>([]);
  const [elements, setElements] = useState<FloorPlanElementRow[]>([]);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [plans, setPlans] = useState<FloorPlanRow[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const activePlans = useMemo(() => plans.filter((p) => p.is_active !== false), [plans]);

  const visibleTables = useMemo(() => {
    if (!activePlanId) return tables;
    return tables.filter((t) => (t.floor_plan_id ?? null) === activePlanId);
  }, [tables, activePlanId]);

  const visibleElements = useMemo(() => {
    if (!activePlanId) return elements;
    return elements.filter((e) => (e.floor_plan_id ?? null) === activePlanId);
  }, [elements, activePlanId]);

  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savingTable, setSavingTable] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [dirtyPlan, setDirtyPlan] = useState(false);

  const [selected, setSelected] = useState<{ kind: "table" | "element"; id: string } | null>(null);
  const selectedTableId = selected?.kind === "table" ? selected.id : null;
  const selectedElementId = selected?.kind === "element" ? selected.id : null;
  const selectedTable = useMemo(
    () => (selectedTableId ? tables.find((t) => t.id === selectedTableId) ?? null : null),
    [tables, selectedTableId],
  );
  const selectedElement = useMemo(
    () => (selectedElementId ? elements.find((e) => e.id === selectedElementId) ?? null : null),
    [elements, selectedElementId],
  );

  // Modals/forms
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planType, setPlanType] = useState<FloorPlanRow["type"]>("custom");

  const [showTableForm, setShowTableForm] = useState(false);
  const [tableName, setTableName] = useState("");
  const [tableMin, setTableMin] = useState(2);
  const [tableMax, setTableMax] = useState(4);
  const [tableStatus, setTableStatus] = useState<TableRow["status"]>("active");
  const [tableNote, setTableNote] = useState("");
  const [tableShape, setTableShape] = useState<FloorPlanTableShape>("round");

  const [showReservationForm, setShowReservationForm] = useState(false);
  const [resGuestName, setResGuestName] = useState("");
  const [resGuestPhone, setResGuestPhone] = useState("");
  const [resGuestEmail, setResGuestEmail] = useState("");
  const [resGuests, setResGuests] = useState(2);
  const [resNote, setResNote] = useState("");
  const [resTime, setResTime] = useState<string>(() => (dinnerStartTime ?? "19:00").slice(0, 5));
  const [resTableId, setResTableId] = useState<string>("");

  // Canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{
    id: string;
    kind: "table" | "element";
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const reservationState = useMemo(() => {
    const targetMs = dateTimeMs(serviceDate, serviceTime);
    const reserved = new Set<string>();
    const reservedByTable = new Map<string, ReservationRow[]>();

    for (const r of reservations) {
      if (!r.table_id) continue;
      if (!r.reservation_time) continue;
      if (r.status !== "pending" && r.status !== "confirmed") continue;

      const startMs = dateTimeMs(serviceDate, r.reservation_time);
      const durMin = durationForStartTime(r.reservation_time, defaultLunchDurationMinutes, defaultDinnerDurationMinutes);
      const endMs = startMs + durMin * 60_000;

      if (startMs <= targetMs && targetMs < endMs) {
        reserved.add(r.table_id);
        const arr = reservedByTable.get(r.table_id) ?? [];
        arr.push(r);
        reservedByTable.set(r.table_id, arr);
      }
    }

    return { reserved, reservedByTable };
  }, [reservations, serviceDate, serviceTime, defaultLunchDurationMinutes, defaultDinnerDurationMinutes]);

  const selectedTableReservations = useMemo(() => {
    if (!selectedTableId) return [];
    return reservationState.reservedByTable.get(selectedTableId) ?? [];
  }, [reservationState.reservedByTable, selectedTableId]);

  const unassignedReservationsAtSelectedTime = useMemo(() => {
    const targetMs = dateTimeMs(serviceDate, serviceTime);
    const arr: ReservationRow[] = [];

    for (const r of reservations) {
      if (r.table_id) continue;
      if (!r.reservation_time) continue;
      if (r.status !== "pending" && r.status !== "confirmed") continue;

      const startMs = dateTimeMs(serviceDate, r.reservation_time);
      const durMin = durationForStartTime(r.reservation_time, defaultLunchDurationMinutes, defaultDinnerDurationMinutes);
      const endMs = startMs + durMin * 60_000;
      if (startMs <= targetMs && targetMs < endMs) {
        arr.push(r);
      }
    }
    return arr.sort((a, b) => (a.reservation_time ?? "").localeCompare(b.reservation_time ?? ""));
  }, [reservations, serviceDate, serviceTime, defaultLunchDurationMinutes, defaultDinnerDurationMinutes]);

  const activeTables = useMemo(() => tables.filter((t) => t.status === "active"), [tables]);

  // (Réserver dans une itération suivante : affichage par zone / tri avancé)

  const refresh = useCallback(async () => {
    setMessage(null);
    setLoading(true);
    const [
      { data: tablesData, error: tablesError },
      { data: elementsData, error: elementsError },
      { data: plansData, error: plansError },
    ] = await Promise.all([
      supabase
        .from("restaurant_tables")
        .select(
          "id, restaurant_id, floor_plan_id, zone_id, name, min_covers, max_covers, status, note, x_position, y_position, width, height, shape, rotation",
        )
        .eq("restaurant_id", restaurantId)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("floor_plan_elements")
        .select("id, restaurant_id, floor_plan_id, type, label, x_position, y_position, width, height, rotation, metadata")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: true }),
      supabase
        .from("floor_plans")
        .select("id, name, type, is_active, sort_order")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    if (tablesError || elementsError || plansError) {
      setMessage(
        tablesError?.message ?? elementsError?.message ?? plansError?.message ?? "Impossible de charger le plan de salle.",
      );
      setLoading(false);
      return;
    }

    setTables((tablesData ?? []) as TableRow[]);
    setElements((elementsData ?? []) as FloorPlanElementRow[]);
    const nextPlans = (plansData ?? []) as FloorPlanRow[];
    setPlans(nextPlans);

    // Plan actif : préfère indoor, sinon premier
    setActivePlanId((prev) => {
      if (prev && nextPlans.some((p) => p.id === prev)) return prev;
      const indoor = nextPlans.find((p) => p.type === "indoor" && p.is_active !== false);
      return indoor?.id ?? nextPlans[0]?.id ?? null;
    });

    setSelected((prev) => prev ?? (tablesData?.[0]?.id ? { kind: "table", id: tablesData[0].id } : null));
    setLoading(false);
  }, [restaurantId, supabase]);

  const refreshReservations = useCallback(async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("id, guest_name, guests, reservation_time, status, table_id, zone")
      .eq("restaurant_id", restaurantId)
      .eq("reservation_date", serviceDate)
      .order("reservation_time", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setReservations((data ?? []) as ReservationRow[]);
  }, [restaurantId, serviceDate, supabase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    void refreshReservations();
  }, [refreshReservations]);

  useEffect(() => {
    // Synchronise l'heure quand on change de période (lunch/dinner).
    const next =
      servicePeriod === "lunch" ? (lunchStartTime ?? "12:00") : (dinnerStartTime ?? "19:00");
    setServiceTime(next.slice(0, 5));
  }, [servicePeriod, lunchStartTime, dinnerStartTime]);

  const getTableVisual = useCallback(
    (t: TableRow) => {
      const isSelected = t.id === selectedTableId;
      const isBlocked = t.status === "blocked";
      const isInactive = t.status === "inactive";
      const isReserved = reservationState.reserved.has(t.id);

      let border = "border-zg-border/70";
      let bg = "bg-zg-surface/40";
      let accent = "text-zg-muted";

      if (isBlocked) {
        border = "border-rose-300/80";
        bg = "bg-rose-50/70";
        accent = "text-rose-900/90";
      } else if (isInactive) {
        border = "border-zg-border/55";
        bg = "bg-zg-surface/30";
        accent = "text-zg-muted";
      } else if (isReserved) {
        border = "border-amber-300/90";
        bg = "bg-amber-50/85";
        accent = "text-amber-950/90";
      } else {
        border = "border-emerald-300/80";
        bg = "bg-emerald-50/75";
        accent = "text-emerald-950/90";
      }

      if (isSelected) {
        border = "border-zg-mint/55";
        bg = "bg-zg-surface-elevated/75";
      }

      return { border, bg, accent };
    },
    [selectedTableId, reservationState.reserved],
  );

  const getElementVisual = useCallback(
    (el: FloorPlanElementRow) => {
      const isSelected = selected?.kind === "element" && selected.id === el.id;

      if (el.type === "wall") {
        return {
          className: cn(
            "border border-zg-border bg-[color-mix(in_srgb,var(--zg-fg)_78%,transparent)]",
            isSelected && "ring-2 ring-zg-mint/55 ring-offset-2 ring-offset-zg-surface/60",
          ),
        };
      }

      if (el.type === "door") {
        return {
          className: cn(
            "border border-zg-border bg-zg-surface",
            isSelected && "ring-2 ring-zg-mint/55 ring-offset-2 ring-offset-zg-surface/60",
          ),
        };
      }

      if (el.type === "window") {
        return {
          className: cn(
            "border border-sky-300/60 bg-sky-50/70",
            isSelected && "ring-2 ring-zg-mint/55 ring-offset-2 ring-offset-zg-surface/60",
          ),
        };
      }

      if (el.type === "zone") {
        return {
          className: cn(
            "border border-zg-border/70 bg-zg-surface/35",
            isSelected && "ring-2 ring-zg-mint/55 ring-offset-2 ring-offset-zg-surface/60",
          ),
        };
      }

      if (el.type === "bar") {
        return {
          className: cn(
            "border border-amber-300/60 bg-amber-50/70",
            isSelected && "ring-2 ring-zg-mint/55 ring-offset-2 ring-offset-zg-surface/60",
          ),
        };
      }

      // label/other
      return {
        className: cn(
          "border border-zg-border/70 bg-zg-surface/70",
          isSelected && "ring-2 ring-zg-mint/55 ring-offset-2 ring-offset-zg-surface/60",
        ),
      };
    },
    [selected],
  );

  async function createPlan(type: FloorPlanRow["type"], nameOverride?: string) {
    setMessage(null);
    const name = (nameOverride ?? planName).trim();
    if (!name) {
      setMessage("Indiquez un nom d’espace.");
      return;
    }
    const nextSort =
      plans.length > 0 ? Math.max(...plans.map((p) => Number(p.sort_order ?? 0))) + 1 : 0;
    const { data, error } = await supabase
      .from("floor_plans")
      .insert({
        restaurant_id: restaurantId,
        name,
        type,
        is_active: true,
        sort_order: nextSort,
      })
      .select("id")
      .maybeSingle();
    if (error) {
      setMessage(error.message);
      return;
    }
    setShowPlanForm(false);
    setPlanName("");
    setPlanType("custom");
    await refresh();
    if (data?.id) setActivePlanId(data.id);
  }

  async function createTable() {
    setMessage(null);
    if (!activePlanId) {
      setMessage("Créez d’abord un espace (Salle intérieure, Terrasse, etc.).");
      return;
    }
    const name = tableName.trim();
    if (!name) {
      setMessage("Indiquez un nom de table.");
      return;
    }
    const min = Math.max(1, Math.floor(tableMin));
    const max = Math.max(min, Math.floor(tableMax));

    const { error } = await supabase.from("restaurant_tables").insert({
      restaurant_id: restaurantId,
      floor_plan_id: activePlanId,
      name,
      min_covers: min,
      max_covers: max,
      status: tableStatus,
      note: tableNote.trim() || null,
      x_position: 100,
      y_position: 100,
      width: 90,
      height: 90,
      shape: tableShape,
      rotation: 0,
    });
    if (error) {
      setMessage(error.message);
      return;
    }

    setShowTableForm(false);
    setTableName("");
    setTableMin(2);
    setTableMax(4);
    setTableStatus("active");
    setTableNote("");
    setTableShape("round");
    await refresh();
  }

  async function updateSelectedTable(patch: Partial<TableRow>) {
    if (!selectedTable) return;
    setSavingTable(true);
    setMessage(null);

    // Éviter de mettre à jour des champs clés (id/restaurant_id).
    const safePatch: Partial<TableRow> = { ...patch };
    delete safePatch.id;
    delete safePatch.restaurant_id;
    if (typeof safePatch.note === "string") safePatch.note = safePatch.note.trim() || null;

    const { error } = await supabase
      .from("restaurant_tables")
      .update(safePatch)
      .eq("id", selectedTable.id)
      .eq("restaurant_id", restaurantId);

    if (error) {
      setMessage(error.message);
      setSavingTable(false);
      return;
    }

    setSavingTable(false);
    await refresh();
  }

  async function deleteTable(id: string) {
    setMessage(null);
    setSavingTable(true);
    const { error } = await supabase.from("restaurant_tables").delete().eq("id", id).eq("restaurant_id", restaurantId);
    if (error) {
      setMessage(error.message);
      setSavingTable(false);
      return;
    }
    setSelected(null);
    setSavingTable(false);
    await refresh();
  }

  const savePlanPositions = useCallback(async () => {
    setSavingPlan(true);
    setMessage(null);
    try {
      // Met à jour uniquement layout (drag & drop) tables + éléments.
      const tableUpdates = tables.map((t) =>
        supabase
          .from("restaurant_tables")
          .update({
            x_position: Math.round(t.x_position),
            y_position: Math.round(t.y_position),
            width: Math.round(t.width),
            height: Math.round(t.height),
            shape: t.shape,
            rotation: Math.round(t.rotation),
          })
          .eq("id", t.id)
          .eq("restaurant_id", restaurantId),
      );

      const elementUpdates = elements.map((el) =>
        supabase
          .from("floor_plan_elements")
          .update({
            type: el.type,
            label: el.label,
            x_position: Math.round(el.x_position),
            y_position: Math.round(el.y_position),
            width: Math.round(el.width),
            height: Math.round(el.height),
            rotation: Math.round(el.rotation),
            metadata: el.metadata,
          })
          .eq("id", el.id)
          .eq("restaurant_id", restaurantId),
      );

      await Promise.all([...tableUpdates, ...elementUpdates]);
      setDirtyPlan(false);
      setMessage("Plan sauvegardé.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur lors de la sauvegarde du plan.");
    } finally {
      setSavingPlan(false);
    }
  }, [tables, elements, supabase, restaurantId]);

  function onCanvasPointerDownTable(e: React.PointerEvent, tableId: string) {
    if (mode !== "edit") return;

    const t = tables.find((x) => x.id === tableId);
    if (!t) return;

    // On sélectionne au début du drag.
    setSelected({ kind: "table", id: tableId });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // Position pointer dans le repère du canvas.
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    draggingRef.current = {
      id: tableId,
      kind: "table",
      pointerId: e.pointerId,
      startX: px,
      startY: py,
      offsetX: px - t.x_position,
      offsetY: py - t.y_position,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onCanvasPointerMove(e: React.PointerEvent) {
    const drag = draggingRef.current;
    if (!drag) return;
    if (mode !== "edit") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const nextX = Math.max(0, px - drag.offsetX);
    const nextY = Math.max(0, py - drag.offsetY);

    if (drag.kind === "table") {
      setTables((cur) => cur.map((t) => (t.id === drag.id ? { ...t, x_position: nextX, y_position: nextY } : t)));
    } else {
      setElements((cur) =>
        cur.map((el) => (el.id === drag.id ? { ...el, x_position: nextX, y_position: nextY } : el)),
      );
    }
    setDirtyPlan(true);
  }

  function onCanvasPointerUp(e: React.PointerEvent) {
    const drag = draggingRef.current;
    if (!drag) return;
    draggingRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function onCanvasPointerDownElement(e: React.PointerEvent, elementId: string) {
    if (mode !== "edit") return;
    const el = elements.find((x) => x.id === elementId);
    if (!el) return;

    setSelected({ kind: "element", id: elementId });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    draggingRef.current = {
      id: elementId,
      kind: "element",
      pointerId: e.pointerId,
      startX: px,
      startY: py,
      offsetX: px - el.x_position,
      offsetY: py - el.y_position,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  async function createElement(type: FloorPlanElementType) {
    setMessage(null);
    const { data, error } = await supabase
      .from("floor_plan_elements")
      .insert({
        restaurant_id: restaurantId,
        floor_plan_id: activePlanId,
        type,
        label:
          type === "label"
            ? "Texte"
            : type === "bar"
              ? "Bar"
              : type === "zone"
                ? "Zone"
                : null,
        x_position: 120,
        y_position: 120,
        width: type === "wall" ? 220 : type === "zone" ? 280 : 140,
        height: type === "wall" ? 18 : type === "zone" ? 180 : 70,
        rotation: 0,
        metadata: {},
      })
      .select("id")
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      return;
    }

    await refresh();
    if (data?.id) {
      setSelected({ kind: "element", id: data.id });
      setDirtyPlan(true);
    }
  }

  async function deleteSelectedElement() {
    if (!selectedElement) return;
    setMessage(null);
    const { error } = await supabase
      .from("floor_plan_elements")
      .delete()
      .eq("id", selectedElement.id)
      .eq("restaurant_id", restaurantId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setSelected(null);
    await refresh();
  }

  function closeActions(detailsEl?: HTMLDetailsElement | null) {
    if (detailsEl) detailsEl.open = false;
  }

  async function moveReservation(reservationId: string, nextTableId: string | null) {
    setMessage(null);
    let floorPlanId: string | null = null;
    if (nextTableId) {
      const { data: t } = await supabase
        .from("restaurant_tables")
        .select("floor_plan_id")
        .eq("restaurant_id", restaurantId)
        .eq("id", nextTableId)
        .maybeSingle();
      floorPlanId = (t?.floor_plan_id as string | null) ?? null;
    }

    const { error } = await supabase
      .from("reservations")
      .update({ table_id: nextTableId, floor_plan_id: floorPlanId })
      .eq("id", reservationId)
      .eq("restaurant_id", restaurantId);
    if (error) {
      setMessage(error.message);
      return;
    }
    await refreshReservations();
  }

  async function createManualReservation() {
    setMessage(null);
    const guestName = resGuestName.trim();
    if (!guestName) {
      setMessage("Indiquez un nom de client.");
      return;
    }
    if (!serviceDate || !resTime) {
      setMessage("Indiquez une date et une heure.");
      return;
    }
    const g = Math.max(1, Math.min(500, Math.floor(resGuests)));

    let floorPlanId: string | null = activePlanId;
    const tableId: string | null = resTableId || null;

    if (tableId) {
      const { data: t, error: tErr } = await supabase
        .from("restaurant_tables")
        .select("id, floor_plan_id, min_covers, max_covers, status")
        .eq("restaurant_id", restaurantId)
        .eq("id", tableId)
        .maybeSingle();
      if (tErr || !t) {
        setMessage("Table introuvable.");
        return;
      }
      floorPlanId = (t.floor_plan_id as string | null) ?? floorPlanId;
    }

    const { error } = await supabase.from("reservations").insert({
      restaurant_id: restaurantId,
      guest_name: guestName,
      guest_phone: resGuestPhone.trim() || null,
      guest_email: resGuestEmail.trim() || null,
      guests: g,
      reservation_date: serviceDate,
      reservation_time: resTime.slice(0, 5),
      status: "confirmed",
      source: "manual_dashboard",
      table_id: tableId,
      floor_plan_id: floorPlanId,
      note: resNote.trim() || null,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setShowReservationForm(false);
    setResGuestName("");
    setResGuestPhone("");
    setResGuestEmail("");
    setResGuests(2);
    setResNote("");
    setResTime((dinnerStartTime ?? "19:00").slice(0, 5));
    setResTableId("");
    await refreshReservations();
  }

  async function updateReservationStatus(reservationId: string, status: ReservationRow["status"]) {
    if (!status) return;
    setMessage(null);
    const res = await fetch(`/api/reservations/${reservationId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setMessage(payload.error ?? "Impossible de mettre à jour le statut.");
      return;
    }
    await refreshReservations();
  }

  return (
    <section className="space-y-8">
      <PageHeader
        kicker="Plan de salle"
        title="Plan de salle"
        subtitle="Créez vos espaces, placez vos tables et suivez votre service."
        primaryAction={{
          kind: "button",
          label: "Nouvelle réservation",
          onClick: () => setShowReservationForm(true),
        }}
        menuItems={[
          { kind: "action", label: "Ajouter une table", onClick: () => setShowTableForm(true) },
          { kind: "action", label: "Ajouter un espace", onClick: () => setShowPlanForm(true) },
          { kind: "action", label: "Ajouter un mur", onClick: () => void createElement("wall") },
          { kind: "action", label: "Ajouter une porte", onClick: () => void createElement("door") },
          { kind: "action", label: "Ajouter une fenêtre", onClick: () => void createElement("window") },
          { kind: "action", label: "Ajouter un texte", onClick: () => void createElement("label") },
          { kind: "action", label: savingPlan ? "Sauvegarde…" : "Sauvegarder le plan", onClick: () => void savePlanPositions(), disabled: !dirtyPlan || savingPlan },
        ]}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center rounded-full border border-zg-border bg-zg-surface p-1 shadow-zg-soft">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={cn(
                "min-h-9 rounded-full px-4 text-sm font-semibold transition",
                mode === "edit" ? "bg-zg-fg text-white" : "text-zg-muted hover:text-zg-fg",
              )}
            >
              Édition
            </button>
            <button
              type="button"
              onClick={() => setMode("service")}
              className={cn(
                "min-h-9 rounded-full px-4 text-sm font-semibold transition",
                mode === "service" ? "bg-zg-fg text-white" : "text-zg-muted hover:text-zg-fg",
              )}
            >
              Service
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="rounded-2xl border border-zg-border bg-zg-surface-soft/80 px-4 py-3 shadow-zg-soft">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="dashboard-field-label">Espace</label>
            <Select value={activePlanId ?? ""} onChange={(e) => setActivePlanId(e.target.value || null)} disabled={activePlans.length === 0}>
              {(activePlans.length ? activePlans : [{ id: "", name: "Aucun espace", type: "custom", is_active: true, sort_order: 0 }]).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-[170px]">
            <label className="dashboard-field-label">Date</label>
            <Input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} />
          </div>
          <div className="w-[150px]">
            <label className="dashboard-field-label">Service</label>
            <Select value={servicePeriod} onChange={(e) => setServicePeriod(e.target.value as "lunch" | "dinner")}>
              <option value="lunch">Midi</option>
              <option value="dinner">Soir</option>
            </Select>
          </div>
          <div className="w-[150px]">
            <label className="dashboard-field-label">Heure</label>
            <Input type="time" value={serviceTime} onChange={(e) => setServiceTime(e.target.value.slice(0, 5))} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zg-muted">
        <span className="rounded-full border border-zg-border/80 bg-zg-surface/70 px-3 py-1 shadow-zg-soft">
          {activeTables.length} tables actives
        </span>
        <span className="rounded-full border border-zg-border/80 bg-zg-surface/70 px-3 py-1 shadow-zg-soft">
          {activeTables.reduce((sum, t) => sum + Math.max(0, t.max_covers), 0)} couverts
        </span>
        <span className="rounded-full border border-zg-border/80 bg-zg-surface/70 px-3 py-1 shadow-zg-soft">
          {reservations.length} réservations
        </span>
        <span className="rounded-full border border-zg-border/80 bg-zg-surface/70 px-3 py-1 shadow-zg-soft">
          {unassignedReservationsAtSelectedTime.length} à placer
        </span>
      </div>

      {message ? <p className="text-sm text-zg-muted">{message}</p> : null}

      {showReservationForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter une réservation</CardTitle>
            <CardDescription>Création manuelle, avec table optionnelle (sinon “à placer”).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Nom du client</label>
                <Input value={resGuestName} onChange={(e) => setResGuestName(e.target.value)} placeholder="Nom / Prénom" />
              </div>
              <div>
                <label className="dashboard-field-label">Téléphone</label>
                <Input value={resGuestPhone} onChange={(e) => setResGuestPhone(e.target.value)} placeholder="+41..." />
              </div>
              <div>
                <label className="dashboard-field-label">E-mail (optionnel)</label>
                <Input type="email" value={resGuestEmail} onChange={(e) => setResGuestEmail(e.target.value)} placeholder="email@..." />
              </div>
              <div>
                <label className="dashboard-field-label">Date</label>
                <Input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} />
              </div>
              <div>
                <label className="dashboard-field-label">Heure</label>
                <Input type="time" value={resTime} onChange={(e) => setResTime(e.target.value.slice(0, 5))} />
              </div>
              <div>
                <label className="dashboard-field-label">Nombre de personnes</label>
                <Input type="number" min={1} max={500} value={resGuests} onChange={(e) => setResGuests(Number(e.target.value))} />
              </div>
              <div>
                <label className="dashboard-field-label">Table (optionnel)</label>
                <Select value={resTableId} onChange={(e) => setResTableId(e.target.value)}>
                  <option value="">À placer</option>
                  {activeTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} · {t.min_covers}–{t.max_covers}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Note interne</label>
                <Textarea value={resNote} onChange={(e) => setResNote(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => void createManualReservation()}>
                Créer la réservation
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowReservationForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Barre déplacée dans la ligne compacte au-dessus */}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Chargement…</CardTitle>
              <CardDescription>Zones & tables</CardDescription>
            </CardHeader>
            <CardContent className="h-24">
              <div className="h-24 rounded-xl bg-zg-highlight/35 animate-pulse" aria-hidden />
              <span className="sr-only">Chargement des espaces et tables</span>
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
      ) : plans.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Créez votre premier espace</CardTitle>
            <CardDescription>Exemples : Salle intérieure, Terrasse, Véranda, Étage…</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => void createPlan("indoor", "Salle intérieure")}>
              Créer une salle intérieure
            </Button>
            <Button type="button" variant="secondary" onClick={() => void createPlan("terrace", "Terrasse")}>
              Créer une terrasse
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowPlanForm(true)}>
              Ajouter un autre espace
            </Button>
          </CardContent>
        </Card>
      ) : tables.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Ajoutez vos tables</CardTitle>
            <CardDescription>Commencez par ajouter quelques tables dans l’espace sélectionné.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => setShowTableForm(true)}>
              Ajouter une table
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowPlanForm(true)}>
              Ajouter un espace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          {/* Canvas */}
          <div className="min-w-0">
            {/* Onglets espaces */}
            {activePlans.length > 0 ? (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {activePlans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePlanId(p.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      activePlanId === p.id
                        ? "border-zg-border-accent bg-zg-highlight/70 text-zg-fg"
                        : "border-zg-border/70 bg-zg-surface/70 text-zg-muted hover:bg-zg-surface/85 hover:text-zg-fg",
                    )}
                  >
                    {p.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowPlanForm(true)}
                  className="rounded-full border border-dashed border-zg-border/70 bg-zg-surface/70 px-4 py-2 text-sm font-semibold text-zg-muted transition hover:bg-zg-surface/85 hover:text-zg-fg"
                >
                  + Ajouter
                </button>
              </div>
            ) : null}

            <div
              ref={canvasRef}
              className={cn(
                "relative overflow-hidden rounded-3xl border border-zg-border bg-zg-surface shadow-zg-card",
                mode === "edit" ? "cursor-grab active:cursor-grabbing" : "cursor-default",
              )}
              style={{
                height: "min(78vh, 820px)",
                backgroundImage:
                  "linear-gradient(to right, color-mix(in srgb, var(--body-text) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--body-text) 10%, transparent) 1px, transparent 1px)",
                backgroundSize: "34px 34px",
              }}
              onPointerMove={onCanvasPointerMove}
              onPointerUp={onCanvasPointerUp}
            >
              {/* Éléments de plan (murs, portes, fenêtres, zones, bar, texte) */}
              {visibleElements.map((el) => {
                const v = getElementVisual(el);
                const style: CSSProperties = {
                  left: el.x_position,
                  top: el.y_position,
                  width: el.width,
                  height: el.height,
                  transform: `rotate(${el.rotation}deg)`,
                };

                return (
                  <div
                    key={el.id}
                    role="button"
                    tabIndex={0}
                    onPointerDown={(e) => onCanvasPointerDownElement(e, el.id)}
                    onClick={() => setSelected({ kind: "element", id: el.id })}
                    className={cn("absolute select-none", v.className)}
                    style={style}
                  >
                    {el.type === "label" || el.type === "zone" || el.type === "bar" ? (
                      <div className="flex h-full w-full items-center justify-center px-2 text-xs font-semibold text-zg-fg">
                        {el.label ?? (el.type === "zone" ? "Zone" : el.type === "bar" ? "Bar" : "Texte")}
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {/* Rendu tables */}
              {visibleTables
                .slice()
                .sort((a, b) => (a.status === "blocked" ? -1 : 1) - (b.status === "blocked" ? -1 : 1))
                .map((t) => {
                  const visual = getTableVisual(t);
                  const isReserved = reservationState.reserved.has(t.id);
                  const isBlocked = t.status === "blocked";
                  const isDisabled = t.status === "inactive";

                  const style = {
                    left: t.x_position,
                    top: t.y_position,
                    ...shapeToStyle(t.shape, t.width, t.height, t.rotation),
                  } as React.CSSProperties;

                  const statusLine = isBlocked
                    ? "Bloquée"
                    : isDisabled
                      ? "Inactive"
                      : isReserved
                        ? "Réservée"
                        : "Libre";

                  return (
                    <div
                      key={t.id}
                      role="button"
                      aria-label={`Table ${t.name}`}
                      tabIndex={0}
                      onPointerDown={(e) => onCanvasPointerDownTable(e, t.id)}
                      onClick={() => {
                        setSelected({ kind: "table", id: t.id });
                      }}
                      className={cn(
                        "absolute select-none transition-shadow",
                        visual.border,
                        visual.bg,
                        "shadow-zg-soft",
                        mode === "edit" ? "hover:shadow-zg-card" : "hover:shadow-zg-card",
                      )}
                      style={{
                        ...style,
                        borderWidth: t.id === selectedTableId ? 3 : 2,
                        borderStyle: "solid",
                      }}
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center px-2 py-1">
                        <div className={cn("text-xs font-bold tracking-tight", visual.accent)}>{t.name}</div>
                        <div className="mt-1 text-[11px] text-zg-muted tabular-nums">
                          {t.min_covers}–{t.max_covers}
                        </div>
                        <div className={cn("mt-1 text-[10px] font-semibold", isBlocked ? "text-rose-900/75" : "text-zg-muted")}>
                          {statusLine}
                        </div>
                      </div>
                    </div>
                  );
                })}
              {/* Zone labels (petite UX) */}
              <div className="pointer-events-none absolute left-5 top-5 rounded-2xl border border-zg-border/70 bg-zg-surface/80 px-3 py-2 text-xs text-zg-muted shadow-zg-soft">
                <div className="font-semibold text-zg-fg">Légende</div>
                <div className="mt-1 space-y-1">
                  <div className="flex gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full border border-emerald-300/80 bg-emerald-50/75" aria-hidden />
                    Libre
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full border border-amber-300/90 bg-amber-50/85" aria-hidden />
                    Réservée
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full border border-rose-300/80 bg-rose-50/70" aria-hidden />
                    Bloquée
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            {mode === "edit" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Propriétés</CardTitle>
                  <CardDescription>
                    {selectedTable
                      ? "Table sélectionnée."
                      : selectedElement
                        ? "Élément sélectionné."
                        : "Sélectionnez un élément pour modifier ses paramètres."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {!selectedTable && !selectedElement ? (
                    <div className="space-y-5">
                      <EmptyState
                        title="Sélection requise"
                        description="Sélectionnez une table ou un élément (mur, porte, zone…) pour modifier ses paramètres."
                      />
                    </div>
                  ) : selectedElement ? (
                    <div className="grid gap-4">
                      <div>
                        <label className="dashboard-field-label">Type</label>
                        <Select
                          value={selectedElement.type}
                          onChange={(e) =>
                            setElements((cur) =>
                              cur.map((x) =>
                                x.id === selectedElement.id ? { ...x, type: e.target.value as FloorPlanElementType } : x,
                              ),
                            )
                          }
                        >
                          <option value="wall">Mur</option>
                          <option value="door">Porte</option>
                          <option value="window">Fenêtre</option>
                          <option value="zone">Zone visuelle</option>
                          <option value="bar">Bar</option>
                          <option value="label">Texte</option>
                          <option value="other">Autre</option>
                        </Select>
                      </div>

                      <div>
                        <label className="dashboard-field-label">Libellé</label>
                        <Input
                          value={selectedElement.label ?? ""}
                          onChange={(e) =>
                            setElements((cur) => cur.map((x) => (x.id === selectedElement.id ? { ...x, label: e.target.value } : x)))
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="dashboard-field-label">Largeur</label>
                          <Input
                            type="number"
                            min={10}
                            value={selectedElement.width}
                            onChange={(e) =>
                              setElements((cur) =>
                                cur.map((x) =>
                                  x.id === selectedElement.id ? { ...x, width: Number(e.target.value) } : x,
                                ),
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="dashboard-field-label">Hauteur</label>
                          <Input
                            type="number"
                            min={10}
                            value={selectedElement.height}
                            onChange={(e) =>
                              setElements((cur) =>
                                cur.map((x) =>
                                  x.id === selectedElement.id ? { ...x, height: Number(e.target.value) } : x,
                                ),
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="dashboard-field-label">Rotation (°)</label>
                        <Input
                          type="number"
                          min={-180}
                          max={180}
                          value={selectedElement.rotation}
                          onChange={(e) =>
                            setElements((cur) =>
                              cur.map((x) =>
                                x.id === selectedElement.id ? { ...x, rotation: Number(e.target.value) } : x,
                              ),
                            )
                          }
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          onClick={() => {
                            setDirtyPlan(true);
                            void savePlanPositions();
                          }}
                        >
                          Enregistrer
                        </Button>
                        <Button type="button" variant="danger" onClick={() => void deleteSelectedElement()}>
                          Supprimer
                        </Button>
                      </div>
                      <p className="text-xs text-zg-muted">
                        Astuce: déplacez l’élément sur le canvas puis cliquez sur <span className="font-semibold">Sauvegarder le plan</span>.
                      </p>
                    </div>
                  ) : (
                    <>
                      {!selectedTable ? (
                        <EmptyState title="Sélection requise" description="Sélectionnez une table pour modifier ses paramètres." />
                      ) : null}
                      <div className="grid gap-4">
                        <div>
                          <label className="dashboard-field-label">Nom</label>
                          <Input
                            value={selectedTable?.name ?? ""}
                            onChange={(e) =>
                              selectedTable
                                ? setTables((cur) => cur.map((t) => (t.id === selectedTable.id ? { ...t, name: e.target.value } : t)))
                                : null
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="dashboard-field-label">Capacité min</label>
                            <Input
                              type="number"
                              min={1}
                              value={selectedTable?.min_covers ?? 2}
                              onChange={(e) => {
                                if (!selectedTable) return;
                                const v = Number(e.target.value);
                                setTables((cur) => cur.map((t) => (t.id === selectedTable.id ? { ...t, min_covers: v } : t)));
                              }}
                            />
                          </div>
                          <div>
                            <label className="dashboard-field-label">Capacité max</label>
                            <Input
                              type="number"
                              min={1}
                              value={selectedTable?.max_covers ?? 4}
                              onChange={(e) => {
                                if (!selectedTable) return;
                                const v = Number(e.target.value);
                                setTables((cur) => cur.map((t) => (t.id === selectedTable.id ? { ...t, max_covers: v } : t)));
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="dashboard-field-label">Forme</label>
                          <Select
                            value={selectedTable?.shape ?? "round"}
                            onChange={(e) =>
                              selectedTable
                                ? setTables((cur) =>
                                    cur.map((t) =>
                                      t.id === selectedTable.id ? { ...t, shape: e.target.value as FloorPlanTableShape } : t,
                                    ),
                                  )
                                : null
                            }
                          >
                            <option value="round">Ronde</option>
                            <option value="square">Carrée</option>
                            <option value="rectangle">Rectangulaire</option>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="dashboard-field-label">Largeur</label>
                            <Input
                              type="number"
                              min={30}
                              value={selectedTable?.width ?? 90}
                              onChange={(e) =>
                                selectedTable
                                  ? setTables((cur) =>
                                      cur.map((t) => (t.id === selectedTable.id ? { ...t, width: Number(e.target.value) } : t)),
                                    )
                                  : null
                              }
                            />
                          </div>
                          <div>
                            <label className="dashboard-field-label">Hauteur</label>
                            <Input
                              type="number"
                              min={30}
                              value={selectedTable?.height ?? 90}
                              onChange={(e) =>
                                selectedTable
                                  ? setTables((cur) =>
                                      cur.map((t) => (t.id === selectedTable.id ? { ...t, height: Number(e.target.value) } : t)),
                                    )
                                  : null
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="dashboard-field-label">Rotation (°)</label>
                          <Input
                            type="number"
                            min={-180}
                            max={180}
                            value={selectedTable?.rotation ?? 0}
                            onChange={(e) =>
                              selectedTable
                                ? setTables((cur) =>
                                    cur.map((t) => (t.id === selectedTable.id ? { ...t, rotation: Number(e.target.value) } : t)),
                                  )
                                : null
                            }
                          />
                        </div>

                        <div>
                          <label className="dashboard-field-label">Zone</label>
                          <Select
                            value={selectedTable?.zone_id ?? ""}
                            onChange={(e) =>
                              selectedTable
                                ? setTables((cur) =>
                                    cur.map((t) =>
                                      t.id === selectedTable.id ? { ...t, zone_id: e.target.value || null } : t,
                                    ),
                                  )
                                : null
                            }
                          >
                            <option value="">(Aucune)</option>
                          </Select>
                          <p className="mt-1 text-xs text-zg-muted">Optionnel (non affiché côté client).</p>
                        </div>

                        <div>
                          <label className="dashboard-field-label">Statut</label>
                          <Select
                            value={selectedTable?.status ?? "active"}
                            onChange={(e) =>
                              selectedTable
                                ? setTables((cur) =>
                                    cur.map((t) => (t.id === selectedTable.id ? { ...t, status: e.target.value } : t)),
                                  )
                                : null
                            }
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="blocked">Bloquée</option>
                          </Select>
                        </div>

                        <div>
                          <label className="dashboard-field-label">Note interne</label>
                          <Textarea
                            value={selectedTable?.note ?? ""}
                            onChange={(e) =>
                              selectedTable
                                ? setTables((cur) =>
                                    cur.map((t) => (t.id === selectedTable.id ? { ...t, note: e.target.value } : t)),
                                  )
                                : null
                            }
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            disabled={savingTable}
                            onClick={() => {
                              // Valide min/max
                              if (!selectedTable) return;
                              const cur = tables.find((t) => t.id === selectedTable.id);
                              if (!cur) return;
                              const safeMin = Math.max(1, Math.floor(cur.min_covers));
                              const safeMax = Math.max(safeMin, Math.floor(cur.max_covers));
                              void updateSelectedTable({
                                min_covers: safeMin,
                                max_covers: safeMax,
                                note: (cur.note ?? "").trim() || null,
                                name: cur.name,
                                zone_id: cur.zone_id,
                                status: cur.status,
                                shape: cur.shape,
                                width: cur.width,
                                height: cur.height,
                                rotation: cur.rotation,
                              });
                            }}
                          >
                            {savingTable ? "Enregistrement…" : "Enregistrer"}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              if (!selectedTable) return;
                              void updateSelectedTable({ status: selectedTable.status === "blocked" ? "active" : "blocked" } as Partial<TableRow>);
                            }}
                            disabled={savingTable}
                          >
                            {(selectedTable?.status ?? "active") === "blocked" ? "Libérer" : "Bloquer temporairement"}
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => (selectedTable ? void deleteTable(selectedTable.id) : null)}
                            disabled={savingTable}
                          >
                            Supprimer
                          </Button>
                        </div>

                        <p className="text-xs text-zg-muted">
                          Astuce: déplacez la table sur le canvas puis cliquez sur <span className="font-semibold">Sauvegarder le plan</span>.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Service</CardTitle>
                  <CardDescription>
                    Vue du créneau sélectionné. Cliquez sur une table pour voir sa réservation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {!selectedTable ? (
                    <EmptyState title="Sélection requise" description="Cliquez sur une table du plan pour voir la réservation associée." />
                  ) : (
                    <>
                      <div className="rounded-2xl border border-zg-border/70 bg-zg-surface/60 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-lg font-bold text-zg-fg">{selectedTable.name}</div>
                            <div className="mt-1 text-sm text-zg-muted">
                              {selectedTable.min_covers}–{selectedTable.max_covers} pers. · {selectedTable.zone_id ?? "Zone"}
                            </div>
                          </div>
                          <div>
                            <span
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                                selectedTable.status === "blocked"
                                  ? "border-rose-300/80 bg-rose-50/70 text-rose-900/85"
                                  : selectedTable.status === "inactive"
                                    ? "border-zg-border/70 bg-zg-surface/60 text-zg-muted"
                                    : "border-emerald-300/80 bg-emerald-50/75 text-emerald-950/85",
                              )}
                            >
                              {selectedTable.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedTableReservations.length === 0 ? (
                        <EmptyState title="Table libre" description="Aucune réservation sur ce créneau (pour cette table)." />
                      ) : (
                        <div className="space-y-3">
                          {selectedTableReservations.map((r) => (
                            <div key={r.id} className="rounded-2xl border border-zg-border/70 bg-zg-surface/60 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-zg-fg">
                                    {(r.reservation_time ?? "").slice(0, 5)} — {r.guest_name ?? "Client"} — {r.guests ?? "-"} pers.
                                  </div>
                                  <div className="mt-1 text-xs text-zg-muted">Statut: {r.status ?? "-"}</div>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Button type="button" variant="secondary" onClick={() => void updateReservationStatus(r.id, "confirmed")}>
                                  Installer
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => void updateReservationStatus(r.id, "completed")}>
                                  Terminé
                                </Button>
                                <Button type="button" variant="danger" onClick={() => void updateReservationStatus(r.id, "cancelled")}>
                                  Libérer
                                </Button>
                              </div>
                              <div className="mt-3 space-y-2">
                                <label className="dashboard-field-label">Déplacer vers une autre table</label>
                                <Select
                                  value={r.table_id ?? ""}
                                  onChange={(e) => void moveReservation(r.id, e.target.value || null)}
                                >
                                  <option value="">À placer</option>
                                  {activeTables
                                    .filter((t) => t.id !== selectedTable.id)
                                    .map((t) => (
                                      <option key={t.id} value={t.id}>
                                        {t.name} · {t.min_covers}–{t.max_covers}
                                      </option>
                                    ))}
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <div className="border-t border-zg-border/80 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-zg-fg">Réservations à placer</div>
                        <div className="mt-1 text-xs text-zg-muted">Assignées uniquement si une table libre convient.</div>
                      </div>
                    </div>
                    {unassignedReservationsAtSelectedTime.length === 0 ? (
                      <p className="mt-4 text-sm text-zg-muted">Aucune réservation à placer sur ce créneau.</p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {unassignedReservationsAtSelectedTime.map((r) => (
                          <div key={r.id} className="rounded-2xl border border-zg-border/70 bg-zg-surface/60 p-4">
                            <div className="text-sm font-semibold text-zg-fg">
                              {(r.reservation_time ?? "").slice(0, 5)} — {r.guest_name ?? "Client"} — {r.guests ?? "-"} pers.
                            </div>
                            <div className="mt-1 text-xs text-zg-muted">Statut: {r.status ?? "-"}</div>
                            <div className="mt-3">
                              <label className="dashboard-field-label">Assigner une table</label>
                              <Select
                                value=""
                                onChange={(e) => {
                                  const next = e.target.value || null;
                                  if (!next) return;
                                  void moveReservation(r.id, next);
                                }}
                              >
                                <option value="">Choisir</option>
                                {activeTables
                                  .filter((t) => t.status !== "blocked")
                                  .map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name} · {t.min_covers}–{t.max_covers}
                                    </option>
                                  ))}
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Form zone */}
      {showPlanForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Nouvel espace</CardTitle>
            <CardDescription>Ex. Salle intérieure, Terrasse, Véranda, Étage…</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="dashboard-field-label">Nom de l’espace</label>
                <Input value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Salle intérieure" />
              </div>
              <div>
                <label className="dashboard-field-label">Type</label>
                <Select value={planType} onChange={(e) => setPlanType(e.target.value as FloorPlanRow["type"])}>
                  <option value="indoor">Salle intérieure</option>
                  <option value="terrace">Terrasse</option>
                  <option value="custom">Autre</option>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => void createPlan(planType)}>
                Créer l’espace
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowPlanForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Form table */}
      {showTableForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle table</CardTitle>
            <CardDescription>Ajoutez une table dans votre plan (puis déplacez-la).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Nom</label>
                <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="Table 1, T2, Terrasse 4…" />
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
                <label className="dashboard-field-label">Statut</label>
                <Select value={tableStatus} onChange={(e) => setTableStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Bloquée</option>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="dashboard-field-label">Forme</label>
                <Select value={tableShape} onChange={(e) => setTableShape(e.target.value as FloorPlanTableShape)}>
                  <option value="round">Ronde</option>
                  <option value="square">Carrée</option>
                  <option value="rectangle">Rectangulaire</option>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="dashboard-field-label">Note (optionnelle)</label>
                <Textarea value={tableNote} onChange={(e) => setTableNote(e.target.value)} placeholder="Près de la fenêtre, table calme…" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => void createTable()}>
                Ajouter la table
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowTableForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Placeholders legacy */}
      {showPlanForm ? null : (
        <div className="hidden">
          {/* placeholder */}
        </div>
      )}

      {/* Les espaces/tables se gèrent via les panneaux de création. */}
    </section>
  );
}

