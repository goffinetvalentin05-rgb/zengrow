"use client";

import { useState } from "react";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Toggle from "@/src/components/ui/toggle";
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
};

export default function AvailabilityEditor({
  restaurantId,
  settings,
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
    const { error } = await supabase
      .from("restaurant_settings")
      .update({
        opening_hours: openingHours,
        max_guests_per_slot: maxGuestsPerSlot,
        reservation_slot_interval: slotInterval,
        reservation_duration: reservationDuration,
      })
      .eq("restaurant_id", restaurantId);

    setSaving(false);
    setMessage(error ? error.message : "Disponibilités enregistrées.");
  }

  return (
    <section className="space-y-12">
      <header>
        <h1 className="dashboard-page-title">Disponibilités</h1>
        <p className="dashboard-section-subtitle mt-2 max-w-2xl">Horaires d&apos;accueil et créneaux.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Horaires par jour</CardTitle>
          <CardDescription>
            Configurez vos disponibilités jour par jour avec une interface simple.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dayOrder.map((day) => {
            const ranges = openingHours[day] ?? [];
            const isOpen = ranges.length > 0;
            return (
              <div key={day} className="border-b border-gray-100 py-6 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{dayLabels[day]}</p>
                  <Toggle checked={isOpen} onChange={(value) => toggleDay(day, value)} label={isOpen ? "Ouvert" : "Fermé"} />
                </div>

                {isOpen && (
                  <div className="mt-3 space-y-2">
                    {ranges.map((range, index) => (
                      <div key={`${day}-${index}`} className="flex flex-wrap items-center gap-2">
                        <Input
                          type="time"
                          className="w-36"
                          value={range.start}
                          onChange={(event) => updateRange(day, index, "start", event.target.value)}
                        />
                        <span className="text-gray-400">à</span>
                        <Input
                          type="time"
                          className="w-36"
                          value={range.end}
                          onChange={(event) => updateRange(day, index, "end", event.target.value)}
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeRange(day, index)}>
                          Supprimer
                        </Button>
                      </div>
                    ))}
                    <Button type="button" size="sm" variant="secondary" onClick={() => addRange(day)}>
                      Ajouter un créneau
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres de réservation</CardTitle>
          <CardDescription>Règles générales appliquées à toutes les réservations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="dashboard-field-label">Couverts max par créneau</label>
            <Input
              type="number"
              min={1}
              value={maxGuestsPerSlot}
              onChange={(event) => setMaxGuestsPerSlot(Number(event.target.value))}
            />
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
            <Select
              value={String(reservationDuration)}
              onChange={(event) => setReservationDuration(Number(event.target.value))}
            >
              <option value="60">60 min</option>
              <option value="90">90 min</option>
              <option value="120">120 min</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={saveAvailability} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer les horaires"}
        </Button>
        {message && <p className="text-sm text-[var(--muted-foreground)]">{message}</p>}
      </div>
    </section>
  );
}
