"use client";

import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";

export default function ReservationsManualForm() {
  const {
    showManualForm,
    createManualReservation,
    setShowManualForm,
    manualWalkInMode,
    setManualWalkInMode,
    setManualGuestName,
    setManualGuestPhone,
    setManualGuestEmail,
    setManualNote,
    setShowWalkInContactFields,
    manualGuestName,
    manualGuestPhone,
    manualGuestEmail,
    manualReservationDate,
    setManualReservationDate,
    manualReservationTime,
    setManualReservationTime,
    manualGuests,
    setManualGuests,
    showZoneUi,
    manualZone,
    setManualZone,
    setManualForceOverbook,
    setManualOverbookWarning,
    zoneLabelTerrace,
    manualOverbookWarning,
    manualForceOverbook,
    showWalkInContactFields,
    manualNote,
    savingId,
  } = useReservations();

  if (!showManualForm) return null;

  return (
    <form
      onSubmit={createManualReservation}
      className="space-y-5 rounded-xl border border-zg-border bg-zg-surface-elevated/80 p-5 shadow-sm transition-all duration-150 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zg-fg">Nouvelle réservation</p>
          <p className="mt-1 text-sm text-zg-muted">Saisie manuelle (walk-in possible).</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowManualForm(false);
            setManualWalkInMode(false);
            setShowWalkInContactFields(false);
          }}
        >
          Fermer
        </Button>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zg-border bg-zg-surface p-4 text-sm text-zg-fg">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-zg-border"
          checked={manualWalkInMode}
          onChange={(e) => {
            const on = e.target.checked;
            setManualWalkInMode(on);
            if (on) {
              setManualGuestName("");
              setManualGuestPhone("");
              setManualGuestEmail("");
              setManualNote("");
              setShowWalkInContactFields(false);
            } else {
              setShowWalkInContactFields(false);
            }
          }}
        />
        <span>
          <span className="font-semibold text-zg-fg">Walk-in (client sans réservation)</span>
          <span className="mt-1 block text-zg-muted">
            Enregistrement minimal : date, créneau, couverts{showZoneUi ? ", zone" : ""}. Le badge Walk-in
            apparaît dans la liste.
          </span>
        </span>
      </label>
      <div className="grid gap-5 md:grid-cols-2">
        {!manualWalkInMode ? (
          <>
            <div>
              <label className="dashboard-field-label">Nom</label>
              <Input value={manualGuestName} onChange={(e) => setManualGuestName(e.target.value)} required />
            </div>
            <div>
              <label className="dashboard-field-label">Téléphone</label>
              <Input value={manualGuestPhone} onChange={(e) => setManualGuestPhone(e.target.value)} required />
            </div>
            <div>
              <label className="dashboard-field-label">Email</label>
              <Input type="email" value={manualGuestEmail} onChange={(e) => setManualGuestEmail(e.target.value)} />
            </div>
          </>
        ) : null}
        <div>
          <label className="dashboard-field-label">Date</label>
          <Input
            type="date"
            value={manualReservationDate}
            onChange={(e) => setManualReservationDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="dashboard-field-label">Heure</label>
          <Input
            type="time"
            value={manualReservationTime}
            onChange={(e) => setManualReservationTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="dashboard-field-label">Couverts</label>
          <Input
            type="number"
            min={1}
            value={manualGuests}
            onChange={(e) => setManualGuests(Number(e.target.value))}
            required
          />
        </div>
        {showZoneUi ? (
          <div className="space-y-2 md:col-span-2">
            <p className="dashboard-field-label">Zone</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="manual-zone"
                  value="interior"
                  checked={manualZone === "interior"}
                  onChange={() => {
                    setManualZone("interior");
                    setManualForceOverbook(false);
                    setManualOverbookWarning(null);
                  }}
                  required
                />
                Salle
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="manual-zone"
                  value="terrace"
                  checked={manualZone === "terrace"}
                  onChange={() => {
                    setManualZone("terrace");
                    setManualForceOverbook(false);
                    setManualOverbookWarning(null);
                  }}
                  required
                />
                {zoneLabelTerrace}
              </label>
            </div>
          </div>
        ) : null}
        {manualOverbookWarning ? (
          <div className="md:col-span-2 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-100">{manualOverbookWarning}</p>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-zg-fg">
              <input
                type="checkbox"
                checked={manualForceOverbook}
                onChange={(e) => setManualForceOverbook(e.target.checked)}
                className="mt-1"
              />
              <span>Forcer la réservation malgré la capacité (surcharge manuelle)</span>
            </label>
          </div>
        ) : null}
        {manualWalkInMode && !showWalkInContactFields ? (
          <div className="md:col-span-2">
            <button
              type="button"
              className="text-sm font-semibold text-zg-teal underline decoration-zg-border-accent underline-offset-2 hover:text-zg-fg"
              onClick={() => setShowWalkInContactFields(true)}
            >
              Ajouter nom, email ou téléphone (optionnel)
            </button>
          </div>
        ) : null}
        {manualWalkInMode && showWalkInContactFields ? (
          <>
            <div>
              <label className="dashboard-field-label">Nom (optionnel)</label>
              <Input value={manualGuestName} onChange={(e) => setManualGuestName(e.target.value)} />
            </div>
            <div>
              <label className="dashboard-field-label">Téléphone (optionnel)</label>
              <Input value={manualGuestPhone} onChange={(e) => setManualGuestPhone(e.target.value)} />
            </div>
            <div>
              <label className="dashboard-field-label">Email (optionnel)</label>
              <Input type="email" value={manualGuestEmail} onChange={(e) => setManualGuestEmail(e.target.value)} />
            </div>
          </>
        ) : null}
        {!manualWalkInMode ? (
          <div className="md:col-span-2">
            <label className="dashboard-field-label">Note</label>
            <Textarea className="min-h-24" value={manualNote} onChange={(e) => setManualNote(e.target.value)} />
          </div>
        ) : null}
      </div>
      <Button
        type="submit"
        disabled={savingId === "manual-create" || (!!manualOverbookWarning && !manualForceOverbook)}
      >
        {savingId === "manual-create"
          ? "Enregistrement…"
          : manualWalkInMode
            ? "Ajouter le walk-in"
            : "Enregistrer"}
      </Button>
    </form>
  );
}

