"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import CustomerContactField from "@/src/components/dashboard/customers/detail/customer-contact-field";
import CustomerDeleteDialog from "@/src/components/dashboard/customers/detail/customer-delete-dialog";
import CustomerDetailSection from "@/src/components/dashboard/customers/detail/customer-detail-section";
import CustomerSegmentBadge from "@/src/components/dashboard/customers/list/customer-segment-badge";
import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";
import { useCustomerDetailData } from "@/src/components/dashboard/customers/hooks/use-customer-detail-data";
import { useCustomerDetailNote } from "@/src/components/dashboard/customers/hooks/use-customer-detail-note";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import ReservationsGuestAvatar from "@/src/components/dashboard/reservations/list-row/reservations-guest-avatar";
import { formatYmdLongFr } from "@/src/components/dashboard/reservations/utils/reservation-date-format";
import { formatGuestPhoneDisplay } from "@/src/components/dashboard/reservations/utils/reservation-list-metadata";
import StatusBadge from "@/src/components/dashboard/status-badge";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import Button from "@/src/components/ui/button";
import Textarea from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";
import { ChevronRight, X } from "lucide-react";

function StatMiniCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zg-border bg-zg-surface-elevated/60 p-4 text-center">
      <p className="text-2xl font-semibold tabular-nums text-zg-fg">{value}</p>
      <p className="mt-1 text-xs text-zg-text-muted">{label}</p>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <ul className="space-y-2" aria-busy aria-label="Chargement de l'historique">
      {Array.from({ length: 3 }, (_, i) => (
        <li key={i} className="h-16 animate-pulse rounded-xl bg-zg-surface-elevated" />
      ))}
    </ul>
  );
}

export default function CustomerDetailModal() {
  const {
    selectedCustomer,
    closeCustomerDetail,
    onEditCustomer,
    deleteCustomer,
    noteDrafts,
    setNoteDrafts,
    noteSavingId,
  } = useCustomers();
  const showToast = useDashboardToast();
  const panelRef = useRef<HTMLDivElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const customerId = selectedCustomer?.id ?? null;
  const open = selectedCustomer != null;

  const { recentReservations, totalReservationCount, stats, loading, error } =
    useCustomerDetailData(customerId);

  useCustomerDetailNote(customerId);
  const isNoteSaving = noteSavingId === customerId;

  useDialogFocusTrap(open, panelRef);

  const close = useCallback(() => {
    setDeleteOpen(false);
    closeCustomerDetail();
  }, [closeCustomerDetail]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleteOpen) close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close, deleteOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!selectedCustomer) return null;

  const customer = selectedCustomer;
  const email = customer.email?.trim() || null;
  const phoneDisplay = formatGuestPhoneDisplay(customer.phone);
  const phoneHref = customer.phone?.replace(/\s/g, "") ?? "";
  const firstVisitLabel = customer.firstVisitAt
    ? formatYmdLongFr(customer.firstVisitAt)
    : "—";
  const avgCoversLabel =
    customer.avgCovers != null
      ? customer.avgCovers.toLocaleString("fr-CH", { maximumFractionDigits: 1 })
      : "—";
  const hasMoreReservations = totalReservationCount > 5;

  async function handleDeleteConfirm() {
    setDeleting(true);
    const ok = await deleteCustomer(customer.id);
    setDeleting(false);
    if (ok) {
      setDeleteOpen(false);
      showToast({ message: "Client supprimé." });
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 p-0 sm:items-center sm:p-4"
        role="presentation"
        onClick={() => !deleteOpen && close()}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-detail-title"
          tabIndex={-1}
          className="flex h-[100dvh] w-full max-w-[700px] flex-col overflow-hidden border-0 border-zg-border bg-zg-surface shadow-xl sm:h-auto sm:max-h-[min(92dvh,860px)] sm:rounded-2xl sm:border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 justify-end px-4 pt-4 sm:px-5">
            <button
              type="button"
              aria-label="Fermer"
              onClick={close}
              className="rounded-lg p-2 text-zg-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <ReservationsGuestAvatar name={customer.name} size="xl" variant="solid" />
              <div className="min-w-0 flex-1 pt-1">
                <h2
                  id="customer-detail-title"
                  className="text-xl font-semibold leading-tight text-zg-fg sm:text-2xl"
                >
                  {customer.name}
                </h2>
                <CustomerSegmentBadge customer={customer} className="mt-3" />
              </div>
            </div>

            <CustomerDetailSection title="Informations" className="mt-8">
              <div className="space-y-3">
                {email ? (
                  <CustomerContactField
                    label="Email"
                    value={email}
                    actionHref={`mailto:${email}`}
                    actionLabel="Envoyer email"
                  />
                ) : (
                  <p className="text-sm text-zg-text-muted">Aucun email renseigné</p>
                )}
                {phoneDisplay ? (
                  <CustomerContactField
                    label="Téléphone"
                    value={phoneDisplay}
                    actionHref={`tel:${phoneHref}`}
                    actionLabel="Appeler"
                  />
                ) : (
                  <p className="text-sm text-zg-text-muted">Aucun téléphone renseigné</p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-zg-border bg-zg-surface-elevated/60 p-4">
                    <p className="text-xs font-medium text-zg-text-muted">Première visite</p>
                    <p className="mt-1 text-sm font-medium text-zg-fg">{firstVisitLabel}</p>
                  </div>
                  <div className="rounded-xl border border-zg-border bg-zg-surface-elevated/60 p-4">
                    <p className="text-xs font-medium text-zg-text-muted">Source d&apos;acquisition</p>
                    <p className="mt-1 text-sm font-medium text-zg-fg">
                      {stats.acquisitionSource ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CustomerDetailSection>

            <CustomerDetailSection title="Statistiques" className="mt-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatMiniCard label="Total visites" value={customer.totalVisits} />
                <StatMiniCard label="Couverts moyens / visite" value={avgCoversLabel} />
                <StatMiniCard label="Total couverts générés" value={stats.totalCovers} />
              </div>
            </CustomerDetailSection>

            <CustomerDetailSection title="Historique des réservations" className="mt-8">
              {loading ? (
                <HistorySkeleton />
              ) : error ? (
                <p className="text-sm text-zg-danger">{error}</p>
              ) : recentReservations.length === 0 ? (
                <p className="text-sm text-zg-text-muted">Aucune réservation enregistrée.</p>
              ) : (
                <ul className="space-y-2" role="list">
                  {recentReservations.map((reservation) => {
                    const time = reservation.reservation_time.trim().slice(0, 5);
                    const note = reservation.internal_note?.trim();
                    return (
                      <li key={reservation.id}>
                        <Link
                          href={`/dashboard/reservations?highlight=${reservation.id}`}
                          className={cn(
                            "group flex flex-col gap-2 rounded-xl border border-zg-border bg-zg-surface-elevated/40 p-4 transition-colors",
                            "hover:border-zg-border-hover hover:bg-zg-card-hover",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zg-fg">
                                {formatYmdLongFr(reservation.reservation_date)} à {time}
                              </p>
                              <p className="mt-0.5 text-sm text-zg-text-muted">
                                {reservation.guests} couvert{reservation.guests > 1 ? "s" : ""}
                              </p>
                            </div>
                            <StatusBadge status={reservation.status} />
                          </div>
                          {note ? (
                            <p className="line-clamp-2 text-xs leading-relaxed text-zg-text-muted">
                              {note}
                            </p>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {hasMoreReservations ? (
                <Link
                  href="/dashboard/reservations"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zg-accent hover:underline"
                >
                  Voir toutes les {totalReservationCount} réservations
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              ) : null}
            </CustomerDetailSection>

            <CustomerDetailSection title="Notes internes" className="mt-8">
              <Textarea
                className="min-h-28"
                value={noteDrafts[customer.id] ?? ""}
                onChange={(e) =>
                  setNoteDrafts((current) => ({
                    ...current,
                    [customer.id]: e.target.value,
                  }))
                }
                placeholder="Préférences, allergies, anniversaires, anecdotes..."
                disabled={isNoteSaving}
                aria-label="Notes internes sur ce client"
              />
              <p className="text-xs text-zg-text-muted">
                {isNoteSaving
                  ? "Enregistrement…"
                  : "Enregistrement automatique après 1 s"}
              </p>
            </CustomerDetailSection>

            <CustomerDetailSection title="Profil" className="mt-8">
              <p className="text-xs text-zg-text-muted">
                Tags personnalisés — bientôt disponibles. Segment calculé automatiquement :
              </p>
              <div className="mt-2">
                <CustomerSegmentBadge customer={customer} />
              </div>
            </CustomerDetailSection>
          </div>

          <footer className="flex shrink-0 flex-col gap-2 border-t border-zg-border px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:grid sm:grid-cols-3 sm:items-center sm:gap-3 sm:px-5 sm:pb-4">
            <Button
              type="button"
              variant="primary"
              className="order-1 w-full sm:order-3 sm:justify-center"
              onClick={close}
            >
              Fermer
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="order-2 w-full sm:order-2 sm:justify-center"
              onClick={() => onEditCustomer(customer.id)}
            >
              Modifier
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="order-3 w-full justify-center text-zg-danger hover:bg-zg-danger-soft-bg hover:text-zg-danger sm:order-1 sm:justify-start"
              onClick={() => setDeleteOpen(true)}
            >
              Supprimer le client
            </Button>
          </footer>
        </div>
      </div>

      <CustomerDeleteDialog
        customerName={customer.name}
        open={deleteOpen}
        saving={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </>
  );
}
