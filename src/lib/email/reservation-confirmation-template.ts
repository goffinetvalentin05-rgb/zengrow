/**
 * Modèles texte pour l’e-mail de confirmation de réservation (structure HTML gérée dans lib/email.ts).
 */

export const DEFAULT_RESERVATION_CONFIRMATION_EMAIL_SUBJECT =
  "Votre réservation chez {{restaurant_name}} est confirmée";

export const DEFAULT_RESERVATION_CONFIRMATION_EMAIL_BODY =
  "Bonjour {{customer_first_name}}, votre réservation pour le {{reservation_date}} à {{reservation_time}} pour {{party_size}} personnes est bien confirmée. Au plaisir de vous accueillir chez {{restaurant_name}}.";

/** Clés reconnues pour le remplacement `{{clé}}` (ordre stable pour l’UI). */
export const RESERVATION_CONFIRMATION_EMAIL_VARIABLE_KEYS = [
  "restaurant_name",
  "customer_first_name",
  "customer_last_name",
  "reservation_date",
  "reservation_time",
  "party_size",
  "reservation_area",
  "restaurant_phone",
  "restaurant_email",
] as const;

export type ReservationConfirmationEmailVariableKey =
  (typeof RESERVATION_CONFIRMATION_EMAIL_VARIABLE_KEYS)[number];

export const RESERVATION_CONFIRMATION_EMAIL_VARIABLES: ReadonlyArray<{
  key: ReservationConfirmationEmailVariableKey;
  label: string;
}> = [
  { key: "restaurant_name", label: "Nom du restaurant" },
  { key: "customer_first_name", label: "Prénom du client" },
  { key: "customer_last_name", label: "Nom du client" },
  { key: "reservation_date", label: "Date de la réservation" },
  { key: "reservation_time", label: "Heure de la réservation" },
  { key: "party_size", label: "Nombre de personnes" },
  { key: "reservation_area", label: "Zone (salle / terrasse)" },
  { key: "restaurant_phone", label: "Téléphone du restaurant" },
  { key: "restaurant_email", label: "E-mail du restaurant" },
];

export type ReservationConfirmationTemplateContext = {
  restaurantName: string;
  guestName: string;
  reservationDateIso: string;
  reservationTime: string;
  partySize: number;
  /** interior | terrace */
  zone: "interior" | "terrace";
  restaurantPhone: string | null | undefined;
  restaurantEmail: string | null | undefined;
};

function splitGuestName(full: string): { first: string; last: string } {
  const t = full.trim();
  if (!t) return { first: "Client", last: "" };
  const parts = t.split(/\s+/);
  const first = parts[0] ?? "Client";
  const last = parts.slice(1).join(" ");
  return { first, last };
}

function formatReservationDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(dt.getTime())) return isoDate;
  return new Intl.DateTimeFormat("fr-CH", { day: "numeric", month: "long", year: "numeric" }).format(dt);
}

function formatReservationTime(time: string): string {
  const t = time.trim().slice(0, 5);
  return t || time;
}

function reservationAreaLabel(zone: "interior" | "terrace"): string {
  return zone === "terrace" ? "Terrasse" : "Salle";
}

export function buildReservationConfirmationVariableValues(
  ctx: ReservationConfirmationTemplateContext,
): Record<ReservationConfirmationEmailVariableKey, string> {
  const { first, last } = splitGuestName(ctx.guestName);
  return {
    restaurant_name: ctx.restaurantName.trim() || "",
    customer_first_name: first,
    customer_last_name: last,
    reservation_date: formatReservationDate(ctx.reservationDateIso),
    reservation_time: formatReservationTime(ctx.reservationTime),
    party_size: String(ctx.partySize),
    reservation_area: reservationAreaLabel(ctx.zone),
    restaurant_phone: (ctx.restaurantPhone ?? "").trim(),
    restaurant_email: (ctx.restaurantEmail ?? "").trim(),
  };
}

/**
 * Remplace les variables `{{clé}}` connues ; les autres laisse inchangées.
 */
export function renderReservationConfirmationText(
  template: string,
  values: Record<ReservationConfirmationEmailVariableKey, string>,
): string {
  let out = template;
  for (const key of RESERVATION_CONFIRMATION_EMAIL_VARIABLE_KEYS) {
    const token = `{{${key}}}`;
    out = out.split(token).join(values[key] ?? "");
  }
  return out;
}

export function effectiveReservationConfirmationSubject(
  custom: string | null | undefined,
  values: Record<ReservationConfirmationEmailVariableKey, string>,
): string {
  const raw = (custom ?? "").trim();
  const template = raw || DEFAULT_RESERVATION_CONFIRMATION_EMAIL_SUBJECT;
  return renderReservationConfirmationText(template, values).trim() || renderReservationConfirmationText(
    DEFAULT_RESERVATION_CONFIRMATION_EMAIL_SUBJECT,
    values,
  );
}

export function effectiveReservationConfirmationBody(
  custom: string | null | undefined,
  values: Record<ReservationConfirmationEmailVariableKey, string>,
): string {
  const raw = (custom ?? "").trim();
  const template = raw || DEFAULT_RESERVATION_CONFIRMATION_EMAIL_BODY;
  const rendered = renderReservationConfirmationText(template, values).trim();
  return rendered || renderReservationConfirmationText(DEFAULT_RESERVATION_CONFIRMATION_EMAIL_BODY, values);
}

/** Données d’exemple pour l’aperçu dans les paramètres restaurant. */
export function sampleReservationConfirmationContext(
  restaurantName: string,
  restaurantPhone?: string | null,
  restaurantEmail?: string | null,
): ReservationConfirmationTemplateContext {
  return {
    restaurantName: restaurantName || "Votre restaurant",
    guestName: "Jean Dupont",
    reservationDateIso: new Date().toISOString().slice(0, 10),
    reservationTime: "19:30",
    partySize: 4,
    zone: "interior",
    restaurantPhone: restaurantPhone ?? "+41 22 000 00 00",
    restaurantEmail: restaurantEmail ?? "contact@restaurant.ch",
  };
}
