"use client";

import { useState } from "react";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Toggle from "@/src/components/ui/toggle";
import PageHeader from "@/src/components/dashboard/page-header";
import ToastInline from "@/src/components/ui/toast-inline";
import { createClient } from "@/src/lib/supabase/client";
import { dayLabels, dayOrder, OpeningHours, OpeningHoursRange } from "@/src/lib/utils";

type AvailabilityEditorProps = {
  restaurantId: string;
  settings: {
    opening_hours: OpeningHours;
    max_guests_per_slot: number;
    reservation_slot_interval: number;
    reservation_duration: number;
  };
  /** Intégré dans Paramètres : pas de PageHeader (évite d’écraser le titre du dashboard). */
  embedded?: boolean;
  /**
   * En mode `embedded`, n’affiche qu’une partie du formulaire (accordéons séparés).
   * La sauvegarde envoie toujours l’ensemble des champs gérés par cet éditeur.
   */
  embeddedPart?: "all" | "hours" | "params";
};

export default function AvailabilityEditor({
  restaurantId,
  settings,
  embedded = false,
  embeddedPart = "all",
}: AvailabilityEditorProps) {
  const supabase = createClient();
  const [openingHours, setOpeningHours] = useState<OpeningHours>(settings.opening_hours);
  const [maxGuestsPerSlot, setMaxGuestsPerSlot] = useState(settings.max_guests_per_slot);
  const [slotInterval, setSlotInterval] = useState(settings.reservation_slot_interval);
  const [reservationDuration, setReservationDuration] = useState(settings.reservation_duration);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateRange(day: string, index: number, key: keyof OpeningHoursRange, value: string) {
    setOpeningHours((current) => ({
      ...current,
      [day]: (current[day] ?? []).map((range, i) => (i === index ? { ...range, [key]: value } : range)),
    }));
  }

  function addRange(day: string) {
    setOpeningHours((current) => ({
      ...current,
      [day]: [...(current[day] ?? []), { start: "12:00", end: "14:00" }],
    }));
  }

  function removeRange(day: string, index: number) {
    setOpeningHours((current) => ({
      ...current,
      [day]: (current[day] ?? []).filter((_, i) => i !== index),
    }));
  }

  function toggleDay(day: string, open: boolean) {
    setOpeningHours((current) => ({
      ...current,
      [day]:
        open
          ? (current[day] ?? []).length > 0
            ? (current[day] ?? [])
            : [{ start: "12:00", end: "14:00" }]
          : [],
    }));
  }

  async function saveAvailability() {
    setSaving(true);
    setMessage(null);
    const payload =
      embeddedPart === "hours"
        ? { opening_hours: openingHours }
        : {
            opening_hours: openingHours,
            max_guests_per_slot: maxGuestsPerSlot,
            reservation_slot_interval: slotInterval,
            reservation_duration: reservationDuration,
          };
    const { error } = await supabase.from("restaurant_settings").update(payload).eq("restaurant_id", restaurantId);

    setSaving(false);
    setMessage(error ? error.message : "Horaires enregistrés.");
  }

  const splitEmbedded = embedded && embeddedPart !== "all";
  const showHours = !embedded || embeddedPart === "all" || embeddedPart === "hours";
  const showParams = !embedded || embeddedPart === "all" || embeddedPart === "params";

  return (
    <section className={embedded ? "space-y-6" : "space-y-8 md:space-y-10"}>
      {embedded && !splitEmbedded ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-zg-fg">Disponibilités</h2>
            <p className="mt-1 text-sm text-zg-text-muted">
              Indiquez vos horaires d’ouverture, affichés sur la page publique.
            </p>
          </div>
          <Button type="button" onClick={saveAvailability} disabled={saving} className="w-full shrink-0 sm:w-auto">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      ) : null}

      {!embedded ? (
        <PageHeader
          title="Disponibilités"
          subtitle="Indiquez quand vous accueillez les réservations, configurez vos services et vos règles de capacité."
          primaryAction={{
            kind: "button",
            label: saving ? "Enregistrement…" : "Enregistrer",
            onClick: saveAvailability,
            disabled: saving,
          }}
        />
      ) : null}

      {splitEmbedded ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {message ? (
            <ToastInline
              tone={
                message.toLowerCase().includes("enregistr") && !message.toLowerCase().includes("impossible")
                  ? "success"
                  : "info"
              }
              message={message}
            />
          ) : (
            <span />
          )}
          <Button type="button" onClick={saveAvailability} disabled={saving} className="w-full shrink-0 sm:w-auto">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      ) : message ? (
        <ToastInline
          tone={message.toLowerCase().includes("enregistr") && !message.toLowerCase().includes("impossible") ? "success" : "info"}
          message={message}
        />
      ) : null}

      <div
        className={
          embedded && embeddedPart === "all"
            ? "grid gap-6 lg:grid-cols-12 lg:items-start"
            : embedded && splitEmbedded
              ? "space-y-6"
              : "grid gap-6 lg:grid-cols-12 lg:items-start"
        }
      >
        {showHours ? (
        <Card className={embedded && embeddedPart === "all" ? "lg:col-span-7" : undefined}>
          <CardHeader>
            <CardTitle>Horaires par jour</CardTitle>
            <CardDescription>Configurez vos disponibilités jour par jour, avec une vue claire.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-zg-border/75 p-0">
            {dayOrder.map((day) => {
              const ranges = openingHours[day] ?? [];
              const isOpen = ranges.length > 0;
              return (
                <div key={day} className="px-5 py-4 md:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zg-fg">{dayLabels[day]}</p>
                      <p className="mt-0.5 text-xs text-zg-fg-muted">
                        {isOpen ? `${ranges.length} plage${ranges.length > 1 ? "s" : ""}` : "Fermé"}
                      </p>
                    </div>
                    <Toggle checked={isOpen} onChange={(value) => toggleDay(day, value)} label={isOpen ? "Ouvert" : "Fermé"} />
                  </div>

                  {isOpen ? (
                    <div className="mt-3 space-y-2">
                      {ranges.map((range, index) => (
                        <div
                          key={`${day}-${index}`}
                          className="flex flex-wrap items-center gap-2 rounded-xl border border-zg-border/80 bg-zg-surface/75 px-3 py-2 shadow-sm"
                        >
                          <Input
                            type="time"
                            className="w-36 bg-zg-surface-elevated"
                            value={range.start}
                            onChange={(event) => updateRange(day, index, "start", event.target.value)}
                          />
                          <span className="text-zg-fg-muted">à</span>
                          <Input
                            type="time"
                            className="w-36 bg-zg-surface-elevated"
                            value={range.end}
                            onChange={(event) => updateRange(day, index, "end", event.target.value)}
                          />
                          <div className="ml-auto">
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeRange(day, index)}>
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button type="button" size="sm" variant="secondary" onClick={() => addRange(day)}>
                        Ajouter une plage
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
        ) : null}

        {showParams ? (
        <div className={embedded && embeddedPart === "all" ? "lg:col-span-5 space-y-6" : "space-y-6"}>
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de réservation</CardTitle>
              <CardDescription>Règles générales appliquées à toutes les réservations.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              <div>
                <label className="dashboard-field-label">Couverts max par créneau</label>
                <Input type="number" min={1} value={maxGuestsPerSlot} onChange={(event) => setMaxGuestsPerSlot(Number(event.target.value))} />
              </div>
              <div>
                <label className="dashboard-field-label">Intervalle des créneaux</label>
                <Select value={String(slotInterval)} onChange={(event) => setSlotInterval(Number(event.target.value))}>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </Select>
              </div>
              <div>
                <label className="dashboard-field-label">Durée de réservation</label>
                <Select value={String(reservationDuration)} onChange={(event) => setReservationDuration(Number(event.target.value))}>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                  <option value="120">120 min</option>
                  <option value="150">150 min</option>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
        ) : null}
      </div>
    </section>
  );
}
