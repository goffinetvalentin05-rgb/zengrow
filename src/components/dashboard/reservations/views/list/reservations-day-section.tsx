"use client";

import { DAY_STATUS_OPTIONS } from "@/src/components/dashboard/reservations/constants";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import ReservationsDayList from "@/src/components/dashboard/reservations/views/list/reservations-day-list";
import type { DayStatusFilter, DayZoneFilter } from "@/src/components/dashboard/reservations/types";
import ActionMenu from "@/src/components/dashboard/ui/action-menu";
import FilterBar from "@/src/components/dashboard/ui/filter-bar";
import { Card, CardContent } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import Select from "@/src/components/ui/select";
import { Calendar } from "lucide-react";

export default function ReservationsDaySection() {
  const {
    daySectionStatus,
    setDaySectionStatus,
    dayZoneFilter,
    setDayZoneFilter,
    showZoneUi,
    dayZoneOptions,
    zoneLabelTerrace,
    todayRows,
    isDayFilterToday,
    showManualForm,
    setShowManualForm,
  } = useReservations();

  const emptyDescription = isDayFilterToday
    ? "Aucune réservation prévue aujourd'hui."
    : "Aucune réservation pour cette date.";

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zg-fg">Réservations du jour</h2>
          <p className="mt-1 text-sm text-zg-text-muted">
            Toutes les réservations du jour choisi, triées par heure.
          </p>
        </div>
        <ActionMenu
          items={[
            {
              kind: "action",
              label: showManualForm ? "Fermer la saisie" : "Saisie manuelle",
              onClick: () => setShowManualForm((c) => !c),
            },
          ]}
        />
      </div>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <FilterBar right={null}>
            <div className="w-[210px]">
              <label className="dashboard-field-label">Statut</label>
              <Select
                value={daySectionStatus}
                onChange={(e) => setDaySectionStatus(e.target.value as DayStatusFilter)}
              >
                {DAY_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            {showZoneUi ? (
              <div className="w-[190px]">
                <label className="dashboard-field-label">Zone</label>
                <Select
                  value={dayZoneFilter}
                  onChange={(e) => setDayZoneFilter(e.target.value as DayZoneFilter)}
                >
                  {dayZoneOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value === "terrace" ? zoneLabelTerrace : opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
          </FilterBar>

          {todayRows.length === 0 ? (
            <EmptyState icon={Calendar} title="Journée tranquille" description={emptyDescription} />
          ) : (
            <ReservationsDayList rows={todayRows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
