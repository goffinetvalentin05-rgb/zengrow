"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import {
  historyStatusDisplayLabel,
  STATUS_LABEL_FR,
} from "@/src/components/dashboard/reservations/constants";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import ReservationDetailCopyChip from "@/src/components/dashboard/reservations/detail/reservation-detail-copy-chip";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import { useReservationDetailNote } from "@/src/components/dashboard/reservations/hooks/use-reservation-detail-note";
import { useReservationRowActions } from "@/src/components/dashboard/reservations/hooks/use-reservation-row-actions";
import ReservationsGuestAvatar from "@/src/components/dashboard/reservations/list-row/reservations-guest-avatar";
import type { ReservationStatus } from "@/src/components/dashboard/reservations/types";
import { formatYmdLongFr } from "@/src/components/dashboard/reservations/utils/reservation-date-format";
import {
  computeGuestVisitStats,
  formatReservationPublicId,
  formatReservationSourceLine,
  formatShortDateFr,
  formatVisitOrdinalFr,
  isPublicReservationSource,
} from "@/src/components/dashboard/reservations/utils/reservation-detail";
import { formatGuestPhoneDisplay } from "@/src/components/dashboard/reservations/utils/reservation-list-metadata";
import StatusBadge from "@/src/components/dashboard/status-badge";
import Button from "@/src/components/ui/button";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { zoneDisplayLabel } from "@/src/lib/reservation/terrace-settings";
import { cn } from "@/src/lib/utils";
import {
  CalendarDays,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Users,
  X,
} from "lucide-react";

function DetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2", className)}>
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zg-text-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

function RecapRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zg-accent" aria-hidden />
      <span>
        <span className="sr-only">{label} · </span>
        {children}
      </span>
    </li>
  );
}

export default function ReservationDetailModal() {
  const {
    selectedReservation,
    setSelectedReservationId,
    reservations,
    showZoneUi,
    zoneLabelTerrace,
    seatingZoneFromRow,
    autoArchiveReservations,
    detailStatusOptions,
    updateStatus,
    savingId,
    noteDrafts,
    setNoteDrafts,
    openEditReservation,
  } = useReservations();

  const { buildHandlers } = useReservationRowActions();
  const panelRef = useRef<HTMLDivElement>(null);
  const open = selectedReservation != null;
  const reservationId = selectedReservation?.id ?? null;

  useDialogFocusTrap(open, panelRef);
  useReservationDetailNote(reservationId);

  const close = useCallback(() => {
    setSelectedReservationId(null);
  }, [setSelectedReservationId]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!selectedReservation) return null;

  const reservation = selectedReservation;
  const timeLabel = reservation.reservation_time.trim().slice(0, 5);
  const zone = seatingZoneFromRow(reservation);
  const zoneLabel = showZoneUi ? zoneDisplayLabel(zone, zoneLabelTerrace) : null;
  const phoneDisplay = formatGuestPhoneDisplay(reservation.guest_phone);
  const phoneHref = reservation.guest_phone?.replace(/\s/g, "") ?? "";
  const email = reservation.guest_email?.trim() || null;
  const guestRequest = reservation.internal_note?.trim() || null;
  const showGuestRequest =
    Boolean(guestRequest) && isPublicReservationSource(reservation.source);
  const sourceLine = formatReservationSourceLine(
    reservation.source,
    reservation.created_at,
    reservation.reservation_type,
  );
  const visitStats = computeGuestVisitStats(reservations, reservation);
  const statusLabel = historyStatusDisplayLabel(reservation, autoArchiveReservations);
  const handlers = buildHandlers(reservation);
  const isSaving = savingId === reservation.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={close}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-detail-title"
        tabIndex={-1}
        className="flex max-h-[100dvh] w-full max-w-[600px] flex-col overflow-hidden rounded-t-2xl border border-zg-border bg-zg-surface shadow-xl transition-all duration-200 sm:max-h-[min(92dvh,800px)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zg-border px-5 py-4">
          <h2 id="reservation-detail-title" className="text-lg font-semibold text-zg-fg">
            Détail de la réservation
          </h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={close}
            className="rounded-lg p-2 text-zg-muted transition-colors duration-150 hover:bg-zg-card-hover hover:text-zg-fg"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <div className="flex items-center gap-4">
            <ReservationsGuestAvatar name={reservation.guest_name} size="lg" variant="solid" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold uppercase tracking-wide text-zg-fg">
                {reservation.guest_name}
              </p>
              <p className="mt-1 text-xs text-zg-text-muted">
                Réservation #{formatReservationPublicId(reservation.id)}
              </p>
              {reservation.reservation_type === "walkin" ? (
                <span className="mt-2 inline-flex rounded-full border border-zg-warning/35 bg-zg-warning-soft-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zg-warning">
                  Walk-in
                </span>
              ) : null}
            </div>
          </div>

          <ul className="mt-6 space-y-3 rounded-xl border border-zg-border bg-zg-surface-elevated/60 p-4">
            <RecapRow icon={CalendarDays} label="Date">
              <span className="font-medium text-zg-fg">
                {formatYmdLongFr(reservation.reservation_date)} à {timeLabel}
              </span>
            </RecapRow>
            <RecapRow icon={Users} label="Couverts">
              <span className="font-medium text-zg-fg">
                {reservation.guests} personne{reservation.guests > 1 ? "s" : ""}
              </span>
            </RecapRow>
            {zoneLabel ? (
              <RecapRow icon={MapPin} label="Zone">
                <span className="font-medium text-zg-fg">{zoneLabel}</span>
              </RecapRow>
            ) : null}
            <RecapRow icon={CalendarDays} label="Statut">
              <StatusBadge status={reservation.status} displayLabel={statusLabel} />
            </RecapRow>
          </ul>

          {(phoneDisplay || email) && (
            <DetailSection title="Coordonnées" className="mt-8">
              {phoneDisplay ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-zg-text-muted" aria-hidden />
                  <a
                    href={`tel:${phoneHref}`}
                    className="font-medium text-zg-fg hover:text-zg-accent"
                  >
                    {phoneDisplay}
                  </a>
                  <a
                    href={`tel:${phoneHref}`}
                    className="rounded-lg border border-zg-border px-2.5 py-1 text-xs font-medium text-zg-text-secondary transition-colors hover:bg-zg-card-hover"
                  >
                    Appeler
                  </a>
                  <ReservationDetailCopyChip label="le téléphone" value={phoneDisplay} />
                </div>
              ) : null}
              {email ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-zg-text-muted" aria-hidden />
                  <a href={`mailto:${email}`} className="font-medium text-zg-fg hover:text-zg-accent">
                    {email}
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="rounded-lg border border-zg-border px-2.5 py-1 text-xs font-medium text-zg-text-secondary transition-colors hover:bg-zg-card-hover"
                  >
                    Email
                  </a>
                  <ReservationDetailCopyChip label="l'email" value={email} />
                </div>
              ) : null}
            </DetailSection>
          )}

          {showGuestRequest ? (
            <DetailSection title="Demandes spéciales" className="mt-8">
              <p className="text-sm leading-relaxed text-zg-fg">{guestRequest}</p>
            </DetailSection>
          ) : null}

          <DetailSection title="Source" className="mt-8">
            <p className="text-sm text-zg-fg">{sourceLine}</p>
          </DetailSection>

          {visitStats.showHistory ? (
            <DetailSection title="Historique client" className="mt-8">
              <Link
                href="/dashboard/customers"
                className="group inline-flex items-center gap-1 text-sm font-medium text-zg-fg transition-colors hover:text-zg-accent"
              >
                <span>
                  {formatVisitOrdinalFr(visitStats.visitCount)}
                  {visitStats.lastVisitYmd
                    ? ` · Dernière le ${formatShortDateFr(visitStats.lastVisitYmd)}`
                    : null}
                </span>
                <ChevronRight
                  className="h-4 w-4 text-zg-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-zg-accent"
                  aria-hidden
                />
              </Link>
            </DetailSection>
          ) : null}

          <DetailSection title="Notes internes" className="mt-8">
            <Textarea
              className="min-h-28"
              value={noteDrafts[reservation.id] ?? ""}
              onChange={(e) =>
                setNoteDrafts((current) => ({
                  ...current,
                  [reservation.id]: e.target.value,
                }))
              }
              placeholder="Pour l'équipe…"
              disabled={isSaving}
            />
            <p className="text-xs text-zg-text-muted">Enregistrement automatique après 1 s</p>
          </DetailSection>

          <DetailSection title="Statut" className="mt-8">
            <Select
              value={reservation.status}
              onChange={(e) =>
                void updateStatus(reservation.id, e.target.value as ReservationStatus)
              }
              disabled={isSaving}
            >
              {detailStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {autoArchiveReservations && status === "completed"
                    ? "Archivée (ancien statut)"
                    : STATUS_LABEL_FR[status]}
                </option>
              ))}
            </Select>
          </DetailSection>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-zg-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="justify-center text-zg-danger hover:bg-zg-danger-soft-bg hover:text-zg-danger"
            disabled={isSaving}
            onClick={() => {
              setSelectedReservationId(null);
              handlers.onCancel();
            }}
          >
            Annuler résa
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              onClick={() => openEditReservation(reservation)}
            >
              Modifier
            </Button>
            <Button type="button" disabled={isSaving} onClick={close}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
