import { createNotification } from "@/src/lib/notifications/create";
import { fireNotification } from "@/src/lib/notifications/fire-and-forget";
import {
  formatReservationNotificationMessage,
  reservationDashboardActionUrl,
} from "@/src/lib/notifications/format";
import type { CreateNotificationResult } from "@/src/lib/notifications/types";

export type ReservationNotificationPayload = {
  restaurantId: string;
  reservationId: string;
  guestName: string;
  guests: number;
  reservationDate: string;
  reservationTime: string;
};

function basePayload(input: ReservationNotificationPayload) {
  return {
    restaurantId: input.restaurantId,
    relatedEntityType: "reservation" as const,
    relatedEntityId: input.reservationId,
    actionUrl: reservationDashboardActionUrl(input.reservationId),
  };
}

export async function notifyReservationCreated(
  input: ReservationNotificationPayload & { status: string },
): Promise<CreateNotificationResult> {
  const statusSuffix =
    input.status === "pending" ? "en attente de confirmation" : null;

  return createNotification({
    ...basePayload(input),
    type: "reservation_created",
    title: "Nouvelle réservation",
    message: formatReservationNotificationMessage({
      guestName: input.guestName,
      guests: input.guests,
      reservationDate: input.reservationDate,
      reservationTime: input.reservationTime,
      statusSuffix,
    }),
  });
}

export function fireReservationCreated(
  input: ReservationNotificationPayload & { status: string },
): void {
  fireNotification(notifyReservationCreated(input));
}

/** Annulation initiée par le client (page publique / lien futur). */
export async function notifyReservationCancelledByClient(
  input: ReservationNotificationPayload,
): Promise<CreateNotificationResult> {
  return createNotification({
    ...basePayload(input),
    type: "reservation_cancelled",
    title: "Réservation annulée",
    message: formatReservationNotificationMessage(input),
  });
}

export function fireReservationCancelledByClient(input: ReservationNotificationPayload): void {
  fireNotification(notifyReservationCancelledByClient(input));
}

/** Modification initiée par le client (à brancher quand l’API publique existera). */
export async function notifyReservationModifiedByClient(
  input: ReservationNotificationPayload,
): Promise<CreateNotificationResult> {
  return createNotification({
    ...basePayload(input),
    type: "reservation_modified",
    title: "Réservation modifiée",
    message: formatReservationNotificationMessage(input),
  });
}

export function fireReservationModifiedByClient(input: ReservationNotificationPayload): void {
  fireNotification(notifyReservationModifiedByClient(input));
}
