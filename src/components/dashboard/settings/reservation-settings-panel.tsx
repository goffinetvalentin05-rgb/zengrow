"use client";

import { useId, useState, type ReactNode } from "react";
import { AlertTriangle, ChevronDown, Users, UtensilsCrossed } from "lucide-react";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Toggle from "@/src/components/ui/toggle";
import { type ReservationMode } from "@/src/lib/reservation/reservation-modes";
import { cn } from "@/src/lib/utils";

function SettingsField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className="dashboard-field-label">{label}</span>
      {description ? <p className="text-sm leading-relaxed text-zg-muted">{description}</p> : null}
      <div>{children}</div>
    </div>
  );
}

type ModeCardProps = {
  mode: ReservationMode;
  selected: boolean;
  title: string;
  description: string;
  example: string;
  icon: ReactNode;
  name: string;
  onSelect: () => void;
};

function ModeCard({ mode, selected, title, description, example, icon, name, onSelect }: ModeCardProps) {
  const inputId = `${name}-${mode}`;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer flex-col gap-3 rounded-2xl border p-5 transition-colors md:p-6",
        selected
          ? "border-zg-accent bg-zg-accent/10 ring-1 ring-zg-accent/40"
          : "border-zg-border bg-zg-surface hover:border-zg-accent/35 hover:bg-zg-surface-elevated",
      )}
    >
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="radio"
          name={name}
          value={mode}
          checked={selected}
          onChange={onSelect}
          className="mt-1 h-4 w-4 shrink-0 accent-zg-accent"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-zg-accent", !selected && "opacity-70")}>{icon}</span>
            <span className="text-base font-semibold text-zg-fg">{title}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zg-muted">{description}</p>
          <p className="mt-3 text-xs font-medium text-zg-text-muted">{example}</p>
        </div>
      </div>
    </label>
  );
}

export type ReservationSettingsPanelProps = {
  reservationMode: ReservationMode;
  savedReservationMode: ReservationMode;
  onReservationModeChange: (mode: ReservationMode) => void;
  showSetupBanner: boolean;
  lunchServiceEnabled: boolean;
  onLunchServiceEnabledChange: (value: boolean) => void;
  dinnerServiceEnabled: boolean;
  onDinnerServiceEnabledChange: (value: boolean) => void;
  lunchServiceStart: string;
  onLunchServiceStartChange: (value: string) => void;
  lunchServiceEnd: string;
  onLunchServiceEndChange: (value: string) => void;
  dinnerServiceStart: string;
  onDinnerServiceStartChange: (value: string) => void;
  dinnerServiceEnd: string;
  onDinnerServiceEndChange: (value: string) => void;
  slotInterval: number;
  onSlotIntervalChange: (value: number) => void;
  daysInAdvance: number;
  onDaysInAdvanceChange: (value: number) => void;
  lunchMaxCovers: number;
  onLunchMaxCoversChange: (value: number) => void;
  dinnerMaxCovers: number;
  onDinnerMaxCoversChange: (value: number) => void;
  lunchDurationMinutes: number;
  onLunchDurationMinutesChange: (value: number) => void;
  dinnerDurationMinutes: number;
  onDinnerDurationMinutesChange: (value: number) => void;
  maxPartySize: number;
  onMaxPartySizeChange: (value: number) => void;
  timeSlotsLunchMaxGroups: number;
  onTimeSlotsLunchMaxGroupsChange: (value: number) => void;
  timeSlotsDinnerMaxGroups: number;
  onTimeSlotsDinnerMaxGroupsChange: (value: number) => void;
  timeSlotsMaxPartySize: number;
  onTimeSlotsMaxPartySizeChange: (value: number) => void;
};

export function ReservationSettingsPanel(props: ReservationSettingsPanelProps) {
  const {
    reservationMode,
    savedReservationMode,
    onReservationModeChange,
    showSetupBanner,
    lunchServiceEnabled,
    onLunchServiceEnabledChange,
    dinnerServiceEnabled,
    onDinnerServiceEnabledChange,
    lunchServiceStart,
    onLunchServiceStartChange,
    lunchServiceEnd,
    onLunchServiceEndChange,
    dinnerServiceStart,
    onDinnerServiceStartChange,
    dinnerServiceEnd,
    onDinnerServiceEndChange,
    slotInterval,
    onSlotIntervalChange,
    daysInAdvance,
    onDaysInAdvanceChange,
    lunchMaxCovers,
    onLunchMaxCoversChange,
    dinnerMaxCovers,
    onDinnerMaxCoversChange,
    lunchDurationMinutes,
    onLunchDurationMinutesChange,
    dinnerDurationMinutes,
    onDinnerDurationMinutesChange,
    maxPartySize,
    onMaxPartySizeChange,
    timeSlotsLunchMaxGroups,
    onTimeSlotsLunchMaxGroupsChange,
    timeSlotsDinnerMaxGroups,
    onTimeSlotsDinnerMaxGroupsChange,
    timeSlotsMaxPartySize,
    onTimeSlotsMaxPartySizeChange,
  } = props;

  const modeGroupName = useId();
  const [helpOpen, setHelpOpen] = useState(false);
  const modeChanged = reservationMode !== savedReservationMode;
  const isGlobalCovers = reservationMode === "global_covers";

  return (
    <div className="space-y-8">
      {showSetupBanner ? (
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-zg-fg"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden />
          <p>
            <span className="font-semibold">Configurez votre capacité</span> pour activer les réservations en
            ligne. Les clients ne pourront pas réserver tant que les limites midi/soir ne sont pas définies.
          </p>
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zg-text-muted">Mode de réservation</h3>
          <p className="mt-1 text-sm text-zg-muted">Choisissez la logique qui correspond à votre salle.</p>
        </div>

        <div
          role="radiogroup"
          aria-label="Mode de réservation"
          className="grid gap-4 md:grid-cols-2"
        >
          <ModeCard
            mode="global_covers"
            selected={reservationMode === "global_covers"}
            title="Couverts globaux"
            description="Recommandé pour les restaurants avec des tables modulables (bistrot, brasserie, banquettes). Vous indiquez votre capacité totale en personnes pour chaque service."
            example='Exemple : "Midi 40 couverts max, soir 60 couverts max"'
            icon={<UtensilsCrossed className="h-5 w-5" aria-hidden />}
            name={modeGroupName}
            onSelect={() => onReservationModeChange("global_covers")}
          />
          <ModeCard
            mode="time_slots"
            selected={reservationMode === "time_slots"}
            title="Slots par tranche"
            description="Recommandé pour les restaurants avec des tables fixes (pizzeria, gastro, tables non assemblables). Vous indiquez combien de groupes vous pouvez accueillir par service."
            example='Exemple : "Midi 6 groupes max, soir 10 groupes max"'
            icon={<Users className="h-5 w-5" aria-hidden />}
            name={modeGroupName}
            onSelect={() => onReservationModeChange("time_slots")}
          />
        </div>

        {modeChanged ? (
          <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm text-zg-muted">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
            <p>
              Le changement de mode prendra effet pour les <span className="font-medium text-zg-fg">nouvelles</span>{" "}
              réservations. Vos réservations existantes ne sont pas modifiées.
            </p>
          </div>
        ) : null}

        <div className="rounded-xl border border-zg-border/80 bg-zg-surface/50">
          <button
            type="button"
            onClick={() => setHelpOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-zg-fg"
          >
            Pas sûr du mode à choisir ?
            <ChevronDown className={cn("h-4 w-4 text-zg-muted transition-transform", helpOpen && "rotate-180")} />
          </button>
          {helpOpen ? (
            <p className="border-t border-zg-border/60 px-4 pb-4 pt-2 text-sm leading-relaxed text-zg-muted">
              Si vous pouvez assembler 2 tables de 4 pour accueillir un groupe de 8, choisissez{" "}
              <span className="font-medium text-zg-fg">Couverts globaux</span>. Si vos tables sont fixes et ne se
              déplacent pas, choisissez <span className="font-medium text-zg-fg">Slots par tranche</span>.
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-5 border-t border-zg-border/60 pt-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zg-text-muted">Capacité</h3>
          <p className="mt-1 text-sm text-zg-muted">
            {isGlobalCovers
              ? "Limites en couverts et durée moyenne de repas par service."
              : "Nombre de groupes simultanés par créneau et taille max. acceptée en ligne."}
          </p>
        </div>

        {isGlobalCovers ? (
          <div className="space-y-6 rounded-2xl border border-zg-border bg-zg-surface p-5 md:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField label="Capacité service midi (couverts max)">
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={lunchMaxCovers}
                  onChange={(e) => onLunchMaxCoversChange(Number(e.target.value))}
                  disabled={!lunchServiceEnabled}
                />
              </SettingsField>
              <SettingsField label="Capacité service soir (couverts max)">
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={dinnerMaxCovers}
                  onChange={(e) => onDinnerMaxCoversChange(Number(e.target.value))}
                  disabled={!dinnerServiceEnabled}
                />
              </SettingsField>
              <SettingsField
                label="Durée moyenne d'un repas midi (minutes)"
                description="La durée moyenne permet de calculer combien de fois une place peut tourner pendant un service."
              >
                <Input
                  type="number"
                  min={30}
                  max={240}
                  value={lunchDurationMinutes}
                  onChange={(e) => onLunchDurationMinutesChange(Number(e.target.value))}
                  disabled={!lunchServiceEnabled}
                />
              </SettingsField>
              <SettingsField
                label="Durée moyenne d'un repas soir (minutes)"
                description="La durée moyenne permet de calculer combien de fois une place peut tourner pendant un service."
              >
                <Input
                  type="number"
                  min={30}
                  max={240}
                  value={dinnerDurationMinutes}
                  onChange={(e) => onDinnerDurationMinutesChange(Number(e.target.value))}
                  disabled={!dinnerServiceEnabled}
                />
              </SettingsField>
              <div className="sm:col-span-2">
                <SettingsField
                  label="Taille max. d'un groupe (couverts)"
                  description="Au-delà, les clients devront vous contacter (page de réservation)."
                >
                  <Input
                    type="number"
                    min={2}
                    max={30}
                    value={maxPartySize}
                    onChange={(e) => onMaxPartySizeChange(Number(e.target.value))}
                  />
                </SettingsField>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 rounded-2xl border border-zg-border bg-zg-surface p-5 md:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField label="Nombre max. de groupes par créneau midi">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={timeSlotsLunchMaxGroups}
                  onChange={(e) => onTimeSlotsLunchMaxGroupsChange(Number(e.target.value))}
                  disabled={!lunchServiceEnabled}
                />
              </SettingsField>
              <SettingsField label="Nombre max. de groupes par créneau soir">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={timeSlotsDinnerMaxGroups}
                  onChange={(e) => onTimeSlotsDinnerMaxGroupsChange(Number(e.target.value))}
                  disabled={!dinnerServiceEnabled}
                />
              </SettingsField>
              <div className="sm:col-span-2">
                <SettingsField
                  label="Taille max. d'un groupe"
                  description="Au-delà de cette taille, les clients devront vous appeler directement. Un message s'affichera sur la page de réservation."
                >
                  <Input
                    type="number"
                    min={2}
                    max={30}
                    value={timeSlotsMaxPartySize}
                    onChange={(e) => onTimeSlotsMaxPartySizeChange(Number(e.target.value))}
                  />
                </SettingsField>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-5 border-t border-zg-border/60 pt-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zg-text-muted">
            Créneaux de réservation
          </h3>
          <p className="mt-1 text-sm text-zg-muted">
            Intervalle des créneaux et plages horaires de réservation par service.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SettingsField label="Intervalle de réservation">
            <Select value={String(slotInterval)} onChange={(e) => onSlotIntervalChange(Number(e.target.value))}>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="60">1 h</option>
            </Select>
          </SettingsField>
          <SettingsField label="Délai max. de réservation à l'avance (jours)">
            <Input
              type="number"
              min={1}
              max={365}
              value={daysInAdvance}
              onChange={(e) => onDaysInAdvanceChange(Number(e.target.value))}
            />
          </SettingsField>
        </div>

        <div className="space-y-6 rounded-2xl border border-zg-border bg-zg-surface p-5 md:p-6">
          <div className="grid gap-4">
            <Toggle checked={lunchServiceEnabled} onChange={onLunchServiceEnabledChange} label="Service midi activé" />
            {lunchServiceEnabled ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingsField label="Première heure de réservation midi">
                  <Input type="time" value={lunchServiceStart} onChange={(e) => onLunchServiceStartChange(e.target.value)} />
                </SettingsField>
                <SettingsField label="Dernière heure de réservation midi">
                  <Input type="time" value={lunchServiceEnd} onChange={(e) => onLunchServiceEndChange(e.target.value)} />
                </SettingsField>
              </div>
            ) : null}
          </div>
          <div className="grid gap-4">
            <Toggle checked={dinnerServiceEnabled} onChange={onDinnerServiceEnabledChange} label="Service soir activé" />
            {dinnerServiceEnabled ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingsField label="Première heure de réservation soir">
                  <Input
                    type="time"
                    value={dinnerServiceStart}
                    onChange={(e) => onDinnerServiceStartChange(e.target.value)}
                  />
                </SettingsField>
                <SettingsField label="Dernière heure de réservation soir">
                  <Input type="time" value={dinnerServiceEnd} onChange={(e) => onDinnerServiceEndChange(e.target.value)} />
                </SettingsField>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}


